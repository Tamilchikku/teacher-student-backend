const mongoose = require('mongoose');
const User = require('../models/User');
const Article = require('../models/Article');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await User.deleteMany();
    await Article.deleteMany();

    // Create teacher
    const teacher = await User.create({
      name: 'John Doe',
      email: 'teacher@example.com',
      password: 'password123',
      role: 'teacher'
    });

    // Create student
    const student = await User.create({
      name: 'Jane Smith',
      email: 'student@example.com',
      password: 'password123',
      role: 'student'
    });

    // Create sample articles
    const articles = await Article.create([
      {
        title: 'Introduction to Physics',
        category: 'Physics',
        contentBlocks: [
          {
            type: 'text',
            content: 'Physics is the natural science that studies matter, its fundamental constituents, its motion and behavior through space and time, and the related entities of energy and force.',
            order: 1
          }
        ],
        createdBy: teacher._id
      },
      {
        title: 'Basic Mathematics Concepts',
        category: 'Math',
        contentBlocks: [
          {
            type: 'text',
            content: 'Mathematics is the science and study of quality, structure, space, and change.',
            order: 1
          }
        ],
        createdBy: teacher._id
      }
    ]);

    console.log('Sample data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();