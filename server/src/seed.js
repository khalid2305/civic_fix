import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Issue from './models/Issue.js';
import Department from './models/Department.js';
import Feedback from './models/Feedback.js';
import connectDB from './config/db.js';

dotenv.config();

const dummyUsers = [
  {
    name: 'John Doe',
    email: 'john@civicfix.com',
    password: 'password123',
    phone: '1234567890',
    role: 'user'
  },
  {
    name: 'Admin User',
    email: 'admin@civicfix.com',
    password: 'adminpassword',
    phone: '0987654321',
    role: 'admin'
  },
  {
    name: 'Priya Rajan',
    email: 'priya@civicfix.com',
    password: 'password123',
    phone: '9876543210',
    role: 'user'
  },
  {
    name: 'Arjun Kumar',
    email: 'arjun@civicfix.com',
    password: 'password123',
    phone: '8765432109',
    role: 'user'
  }
];

const dummyDepartments = [
  { name: 'Roads & Works', short: 'PWD', color: '#f59e0b' },
  { name: 'Water & Sanitation', short: 'W&S', color: '#3b82f6' },
  { name: 'Electricity Board', short: 'EB', color: '#eab308' },
  { name: 'Parks & Recreation', short: 'P&R', color: '#10b981' }
];

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Issue.deleteMany();
    await Department.deleteMany();
    await Feedback.deleteMany();

    console.log('Data Cleared...');

    const createdUsers = await User.create(dummyUsers);
    const createdDepts = await Department.create(dummyDepartments);

    const dummyIssues = [
      {
        title: 'Large Pothole on Main Road',
        description: 'There is a huge pothole that is causing traffic delays and vehicle damage.',
        category: 'Roads & Potholes',
        status: 'pending',
        location: {
          type: 'Point',
          coordinates: [80.2707, 13.0827] // [lng, lat] for Chennai
        },
        address: 'Main Road, Chennai',
        latitude: 13.0827,
        longitude: 80.2707,
        reporterName: 'John Doe',
        imageUrl: 'https://placehold.co/600x400/1e293b/a8b2d1?text=Pothole',
        createdBy: createdUsers[0]._id,
        department: createdDepts[0]._id
      },
      {
        title: 'Water pipe leak',
        description: 'Clean drinking water is being wasted due to a burst pipe.',
        category: 'Water Supply',
        status: 'in-progress',
        location: {
          type: 'Point',
          coordinates: [80.2000, 13.0500]
        },
        address: 'T Nagar, Chennai',
        latitude: 13.0500,
        longitude: 80.2000,
        reporterName: 'John Doe',
        imageUrl: 'https://placehold.co/600x400/1e293b/a8b2d1?text=Water+Leak',
        createdBy: createdUsers[0]._id,
        department: createdDepts[1]._id
      },
      {
        title: 'Fallen Tree Blocking Road',
        description: 'A large banyan tree fell during the storm last night, completely blocking the intersection.',
        category: 'Other',
        status: 'pending',
        location: { type: 'Point', coordinates: [80.2500, 13.0400] },
        address: 'Mylapore, Chennai',
        latitude: 13.0400,
        longitude: 80.2500,
        reporterName: 'John Doe',
        imageUrl: 'https://placehold.co/600x400/1e293b/a8b2d1?text=Fallen+Tree',
        createdBy: createdUsers[0]._id,
        department: createdDepts[3]._id
      },
      {
        title: 'Streetlights Not Working',
        description: 'The streetlights on 4th Avenue have not been working for the past 3 days. It is very dark and unsafe at night.',
        category: 'Streetlights',
        status: 'resolved',
        location: { type: 'Point', coordinates: [80.2100, 13.0850] },
        address: 'Anna Nagar, Chennai',
        latitude: 13.0850,
        longitude: 80.2100,
        reporterName: 'John Doe',
        imageUrl: 'https://placehold.co/600x400/1e293b/a8b2d1?text=Dark+Street',
        createdBy: createdUsers[0]._id,
        department: createdDepts[2]._id
      },
      {
        title: 'Garbage Dumped in Park',
        description: 'People are illegally dumping construction waste inside the children\'s park.',
        category: 'Garbage Collection',
        status: 'pending',
        location: { type: 'Point', coordinates: [80.2550, 12.9800] },
        address: 'Adyar, Chennai',
        latitude: 12.9800,
        longitude: 80.2550,
        reporterName: 'John Doe',
        imageUrl: 'https://placehold.co/600x400/1e293b/a8b2d1?text=Garbage+Dump',
        createdBy: createdUsers[0]._id,
        department: createdDepts[3]._id
      },
      {
        title: 'Sewage Overflow',
        description: 'Sewage mixed with rainwater is overflowing onto the streets, causing a severe health hazard.',
        category: 'Sewerage/Drainage',
        status: 'in-progress',
        location: { type: 'Point', coordinates: [80.2200, 13.1000] },
        address: 'Perambur, Chennai',
        latitude: 13.1000,
        longitude: 80.2200,
        reporterName: 'John Doe',
        imageUrl: 'https://placehold.co/600x400/1e293b/a8b2d1?text=Sewage+Issue',
        createdBy: createdUsers[0]._id,
        department: createdDepts[1]._id
      },
      {
        title: 'Unauthorised Road Digging',
        description: 'Private telecom contractors dug up the newly laid tar road over the weekend.',
        category: 'Roads & Potholes',
        status: 'pending',
        location: { type: 'Point', coordinates: [80.2400, 13.0600] },
        address: 'Nungambakkam, Chennai',
        latitude: 13.0600,
        longitude: 80.2400,
        reporterName: 'John Doe',
        imageUrl: 'https://placehold.co/600x400/1e293b/a8b2d1?text=Damaged+Road',
        createdBy: createdUsers[0]._id,
        department: createdDepts[0]._id
      }
    ];

    await Issue.create(dummyIssues);

    const dummyFeedback = [
      {
        userId: createdUsers[0]._id,
        rating: 5,
        message: 'The pothole on Main Road was fixed within 2 days of my report. Impressed by the prompt response of the civic team!',
        status: 'reviewed'
      },
      {
        userId: createdUsers[2]._id,
        rating: 4,
        message: 'Good platform overall. Very easy to report issues. The water leak in T Nagar took a week to fix but I am satisfied.',
        status: 'resolved'
      },
      {
        userId: createdUsers[3]._id,
        rating: 3,
        message: 'The app is helpful but the categories need more options. I had to use \'Other\' for my issue about a stray animal. Please add more categories.',
        status: 'pending'
      },
      {
        userId: createdUsers[0]._id,
        rating: 2,
        message: 'The garbage dump complaint in Adyar has been pending for 3 weeks. No action taken yet. Please look into this urgently.',
        status: 'pending'
      }
    ];

    await Feedback.create(dummyFeedback);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
