const Event = require('../models/Event');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { getBudgetUtilization } = require('../services/budgetService');
const { successResponse, errorResponse } = require('../utils/helpers');
const { logAuditAction } = require('../services/auditService');

// @desc    Get all events with budget utilization calculation
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res, next) => {
  try {
    const { status, search, onlyActive } = req.query;
    const query = {};

    if (onlyActive === 'true') {
      query.isActive = { $ne: false };
      query.status = { $nin: ['COMPLETED', 'CANCELLED'] };
    } else if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'fullName email')
      .sort({ startDate: -1 })
      .lean();

    // Attach budget utilization statistics and linked expenses for each event
    const eventsWithBudget = await Promise.all(
      events.map(async (event) => {
        const budgetUtil = await getBudgetUtilization(event._id);
        const eventExpenses = await Expense.find(
          { event: event._id },
          'expenseCode title amount approvedAmount status paidBy expenseDate category paymentMethod'
        )
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...event,
          budgetUtilization: budgetUtil,
          expenses: eventExpenses,
        };
      })
    );

    return successResponse(res, 200, 'Events retrieved successfully', eventsWithBudget);
  } catch (error) {
    next(error);
  }
};

// @desc    Create Event (Admin)
// @route   POST /api/events
// @access  Private (Admin)
const createEvent = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, venue, allocatedBudget } = req.body;

    const budgetValue =
      allocatedBudget !== undefined && allocatedBudget !== '' && !isNaN(Number(allocatedBudget))
        ? Number(allocatedBudget)
        : 0;

    const event = await Event.create({
      name,
      description: description || '',
      startDate,
      endDate,
      venue: venue || 'Main Campus',
      allocatedBudget: budgetValue,
      status: 'UPCOMING',
      isActive: true,
      createdBy: req.user._id,
    });

    // Also create corresponding budget record
    await Budget.create({
      event: event._id,
      title: `${name} Event Budget`,
      allocatedAmount: budgetValue,
    });

    await logAuditAction({
      user: req.user._id,
      action: 'EVENT_CREATED',
      entityType: 'Event',
      entityId: event._id,
      description: `Created event '${name}' with budget ₹${budgetValue}`,
    });

    return successResponse(res, 201, 'Event created successfully', event);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// @desc    Update Event status or details
// @route   PUT /api/events/:id
// @access  Private (Admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return errorResponse(res, 404, 'Event not found');

    const { name, description, startDate, endDate, venue, allocatedBudget, status, isActive } = req.body;

    if (name) event.name = name;
    if (description !== undefined) event.description = description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (venue) event.venue = venue;
    if (status) {
      event.status = status;
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        event.isActive = false;
      }
    }
    if (typeof isActive === 'boolean') {
      event.isActive = isActive;
      if (!isActive) {
        event.status = 'COMPLETED';
      } else if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
        event.status = 'ACTIVE';
      }
    }
    if (allocatedBudget !== undefined) {
      const budgetValue =
        allocatedBudget !== '' && !isNaN(Number(allocatedBudget))
          ? Number(allocatedBudget)
          : 0;
      event.allocatedBudget = budgetValue;

      // Update budget object
      const budget = await Budget.findOne({ event: event._id });
      if (budget) {
        budget.allocatedAmount = budgetValue;
        await budget.save();
      }
    }

    await event.save();

    await logAuditAction({
      user: req.user._id,
      action: 'EVENT_UPDATED',
      entityType: 'Event',
      entityId: event._id,
      description: `Updated event '${event.name}'`,
    });

    return successResponse(res, 200, 'Event updated successfully', event);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Event active/ended status
// @route   PATCH /api/events/:id/toggle-status
// @access  Private (Admin, Faculty Coordinator)
const toggleEventStatus = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return errorResponse(res, 404, 'Event not found');

    const { isActive, status } = req.body;
    if (typeof isActive === 'boolean') {
      event.isActive = isActive;
      if (!isActive) {
        event.status = 'COMPLETED';
      } else if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
        event.status = 'ACTIVE';
      }
    } else if (status) {
      event.status = status;
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        event.isActive = false;
      } else {
        event.isActive = true;
      }
    } else {
      // Toggle current isActive state
      event.isActive = event.isActive === false ? true : false;
      event.status = event.isActive ? 'ACTIVE' : 'COMPLETED';
    }

    await event.save();

    await logAuditAction({
      user: req.user._id,
      action: 'EVENT_STATUS_TOGGLED',
      entityType: 'Event',
      entityId: event._id,
      description: `${req.user.fullName} (${req.user.role}) toggled event '${event.name}' status to ${event.status} (Active: ${event.isActive})`,
    });

    return successResponse(res, 200, `Event '${event.name}' is now ${event.isActive ? 'ACTIVE' : 'ENDED (CLOSED)'}`, event);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Event
// @route   DELETE /api/events/:id
// @access  Private (Admin, Faculty Coordinator)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return errorResponse(res, 404, 'Event not found');

    const eventName = event.name;

    // Unlink any expenses that were linked to this event
    await Expense.updateMany({ event: event._id }, { $set: { event: null } });

    // Delete associated budget if any
    await Budget.deleteMany({ event: event._id });

    // Delete event
    await Event.findByIdAndDelete(event._id);

    await logAuditAction({
      user: req.user._id,
      action: 'EVENT_DELETED',
      entityType: 'Event',
      entityId: event._id,
      description: `${req.user.fullName} (${req.user.role}) deleted event '${eventName}'`,
    });

    return successResponse(res, 200, `Event '${eventName}' deleted successfully`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  toggleEventStatus,
  deleteEvent,
};
