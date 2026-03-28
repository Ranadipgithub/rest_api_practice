const Task = require('../models/Task');

// @desc    Get all tasks (user sees own, admin sees all)
// @route   GET /api/v1/tasks
exports.getTasks = async (req, res, next) => {
  try {
    let query;

    // Admin can see all tasks, users see only their own
    if (req.user.role === 'admin') {
      query = Task.find().populate('user', 'name email');
    } else {
      query = Task.find({ user: req.user._id });
    }

    // Sorting
    const sortBy = req.query.sortBy || '-createdAt';
    query = query.sort(sortBy);

    // Filtering by status
    if (req.query.status) {
      query = query.where('status').equals(req.query.status);
    }

    // Filtering by priority
    if (req.query.priority) {
      query = query.where('priority').equals(req.query.priority);
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const tasks = await query;

    // Get total count for pagination info
    const totalFilter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const total = await Task.countDocuments(totalFilter);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check ownership (non-admin can only see their own tasks)
    if (task.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/v1/tasks
exports.createTask = async (req, res, next) => {
  try {
    // Set the user field to the logged-in user
    req.body.user = req.user._id;

    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check ownership
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    // Prevent changing the task owner
    delete req.body.user;

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check ownership (owner or admin can delete)
    if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
