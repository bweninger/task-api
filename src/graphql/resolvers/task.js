const validator = require('validator');
const Task = require('../../models/task');

const formatTask = task => {
  return {
    _id: task._id.toString(),
    summary: task.summary,
    isCompleted: task.isCompleted,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
};

const validateInput = (summary, isCompleted) => {
  const errors = [];

  if (typeof summary == 'string' && !validator.isLength(summary, { min: 10, max: 150 })) {
    errors.push({
      message: `Summary does not fulfill the length requirements (10-150 characters): ${summary}`
    });
  }
  if (isCompleted && !validator.isBoolean(isCompleted.toString())) {
    errors.push({ message: `isCompleted has to be a boolean, instead got ${isCompleted}` });
  }
  if (errors.length > 0) {
    const error = new Error('The input failed validation.');
    error.code = 422;
    error.data = errors;
    throw error;
  }
};

const validateTaskExists = (task) => {
  if (!task) {
    const error = new Error('Task not found!');
    error.code = 404;
    throw error;
  }
}

module.exports = {
  tasks: async ({ excludeCompleted }) => {
    let rawTasks;
    if (excludeCompleted) {
      rawTasks = await Task.find({ isCompleted: false }).sort({ createdAt: -1 });
    } else {
      rawTasks = await Task.find().sort({ createdAt: -1 });
    }

    if (!rawTasks) {
      const error = new Error('No matching tasks found.');
      error.code = 404;
      throw error;
    }

    const tasks = rawTasks.map(formatTask);
    return tasks;
  },

  task: async ({ id }) => {
    const task = await Task.findById(id);
    validateTaskExists(task)
    return formatTask(task);
  },

  createTask: async ({ summary }) => {
    validateInput(summary);
    const task = new Task({ summary });
    const createdTask = await task.save();

    if (!createdTask) {
      const error = new Error('Creation of a new task in the database failed.');
      error.code = 500;
      throw error;
    }

    return formatTask(createdTask);
  },

  updateTask: async ({ id, taskUpdate }) => {
    validateInput(taskUpdate.summary, taskUpdate.isCompleted);
    const task = await Task.findById(id);

    validateTaskExists(task);

    task.summary = taskUpdate.summary ?? task.summary;
    task.isCompleted = taskUpdate.isCompleted ?? task.isCompleted;
    const updateTask = await task.save();
    return formatTask(updateTask);
  },

  deleteTask: async ({ id }) => {
    const task = await Task.findByIdAndRemove(id);
    validateTaskExists(task)
    return true;
  }
};
