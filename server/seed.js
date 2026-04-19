require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const Tailor   = require('./models/Tailor');
const Order    = require('./models/Order');
const Review   = require('./models/Review');

const hash = p => bcrypt.hash(p, 10);
const URI  = process.env.MONGODB_URI || 'mongodb://localhost:27017/stitchify';

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB…');
    await mongoose.connect(URI);
    console.log('✅ Connected\n');

    await Promise.all([User.deleteMany({}), Tailor.deleteMany({}), Order.deleteMany({}), Review.deleteMany({})]);

    // Customers
    const customers = await User.insertMany([
      { name:'Priya Sharma',  email:'priya@example.com',  password:await hash('demo1234'), phone:'9876543210', address:'12 Gandhi Nagar, Sector 5', city:'Lucknow' },
      { name:'Ananya Gupta',  email:'ananya@example.com', password:await hash('demo1234'), phone:'9123456789', address:'7 Hazratganj',              city:'Lucknow' },
      { name:'Meera Joshi',   email:'meera@example.com',  password:await hash('demo1234'), phone:'9012345678', address:'45 Civil Lines',            city:'Delhi' },
    ]);

    // Tailors
    const tailors = await Tailor.insertMany([
      {
        shopName:'Royal Stitch Boutique', proprietorName:'Ramesh Yadav',
        email:'ramesh@tailor.com', password:await hash('demo1234'), phone:'9800011122',
        shopAddress:'15 Aminabad Market, Lucknow', city:'Lucknow',
        servicesOffered:['kurta','shirt','pant','suit','alteration'],
        experience:18, description:'Trusted by families for over 18 years. Specialising in traditional and formal wear.',
        shopImage:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&fit=crop',
        capacityPerDay:8, isVerified:true, isAvailable:true, averageRating:4.8, totalReviews:2,
      },
      {
        shopName:'Silk & Thread', proprietorName:'Sunita Devi',
        email:'sunita@tailor.com', password:await hash('demo1234'), phone:'9700022233',
        shopAddress:'88 Hazratganj, Lucknow', city:'Lucknow',
        servicesOffered:['blouse','saree','lehenga','dress','kurta'],
        experience:12, description:'Master craftsperson specialising in bridal wear, blouses and lehengas.',
        shopImage:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&fit=crop',
        capacityPerDay:5, isVerified:true, isAvailable:true, averageRating:4.6, totalReviews:1,
      },
      {
        shopName:'Delhi Darzi House', proprietorName:'Mohit Verma',
        email:'mohit@tailor.com', password:await hash('demo1234'), phone:'9500044455',
        shopAddress:'22 Karol Bagh, Delhi', city:'Delhi',
        servicesOffered:['kurta','suit','pant','shirt','jacket'],
        experience:22, description:'Three-generation tailoring heritage. Known for precision fitting.',
        shopImage:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&fit=crop',
        capacityPerDay:10, isVerified:true, isAvailable:true, averageRating:4.9, totalReviews:1,
      },
      {
        shopName:'New Look Tailors', proprietorName:'Rajesh Shah',
        email:'rajesh@tailor.com', password:await hash('demo1234'), phone:'9300066677',
        shopAddress:'11 CG Road, Ahmedabad', city:'Ahmedabad',
        servicesOffered:['kurta','suit','pant'], experience:5, shopImage:'',
        capacityPerDay:5, isVerified:false, isAvailable:true,
      },
    ]);

    // Orders
    const orders = await Order.insertMany([
      { customerId:customers[0]._id, tailorId:tailors[0]._id, services:[{name:'kurta',price:700,qty:1},{name:'pant',price:450,qty:1}], totalPrice:1150, status:'completed', scheduledDate:new Date('2024-11-10'), deliveryDate:new Date('2024-11-15'), timeSlot:'11:00 AM – 1:00 PM', pickupAddress:'12 Gandhi Nagar, Lucknow', deliveryAddress:'12 Gandhi Nagar, Lucknow', address:'12 Gandhi Nagar, Lucknow', notes:'Festive kurta with thread work', paymentStatus:'paid', paymentMethod:'UPI', isReviewed:true },
      { customerId:customers[1]._id, tailorId:tailors[0]._id, services:[{name:'shirt',price:550,qty:2}], totalPrice:1100, status:'completed', scheduledDate:new Date('2024-11-20'), timeSlot:'9:00 AM – 11:00 AM', pickupAddress:'7 Hazratganj, Lucknow', deliveryAddress:'7 Hazratganj, Lucknow', address:'7 Hazratganj, Lucknow', paymentStatus:'paid', paymentMethod:'Cash', isReviewed:true },
      { customerId:customers[0]._id, tailorId:tailors[1]._id, services:[{name:'blouse',price:450,qty:1},{name:'lehenga',price:4500,qty:1}], totalPrice:4950, status:'completed', scheduledDate:new Date('2024-12-01'), deliveryDate:new Date('2024-12-08'), timeSlot:'3:00 PM – 5:00 PM', pickupAddress:'12 Gandhi Nagar, Lucknow', deliveryAddress:'45 Model Town, Lucknow', address:'12 Gandhi Nagar, Lucknow', notes:'Bridal set — deep back blouse', paymentStatus:'unpaid', isReviewed:true },
      { customerId:customers[2]._id, tailorId:tailors[2]._id, services:[{name:'suit',price:2800,qty:1}], totalPrice:2800, status:'completed', scheduledDate:new Date('2024-12-10'), timeSlot:'1:00 PM – 3:00 PM', pickupAddress:'45 Civil Lines, Delhi', deliveryAddress:'45 Civil Lines, Delhi', address:'45 Civil Lines, Delhi', paymentStatus:'paid', paymentMethod:'Card', isReviewed:true },
      // Active orders
      { customerId:customers[0]._id, tailorId:tailors[0]._id, services:[{name:'pant',price:450,qty:1}], totalPrice:450, status:'confirmed', scheduledDate:new Date(Date.now()+2*86400000), deliveryDate:new Date(Date.now()+7*86400000), timeSlot:'3:00 PM – 5:00 PM', pickupAddress:'12 Gandhi Nagar, Lucknow', deliveryAddress:'12 Gandhi Nagar, Lucknow', address:'12 Gandhi Nagar, Lucknow', notes:'Slim fit grey wool', paymentStatus:'unpaid', paymentMethod:'COD' },
      { customerId:customers[1]._id, tailorId:tailors[1]._id, services:[{name:'blouse',price:400,qty:1}], totalPrice:400, status:'in_progress', scheduledDate:new Date(Date.now()+86400000), timeSlot:'11:00 AM – 1:00 PM', pickupAddress:'7 Hazratganj, Lucknow', deliveryAddress:'7 Hazratganj, Lucknow', address:'7 Hazratganj, Lucknow', paymentStatus:'unpaid' },
    ]);

    // Reviews
    await Review.insertMany([
      { customerId:customers[0]._id, tailorId:tailors[0]._id, orderId:orders[0]._id, rating:5, comment:'Perfect fit! The thread work was exactly what I wanted.', customerName:'Priya Sharma' },
      { customerId:customers[1]._id, tailorId:tailors[0]._id, orderId:orders[1]._id, rating:5, comment:'Ramesh bhaiya is the best tailor in Lucknow!', customerName:'Ananya Gupta' },
      { customerId:customers[0]._id, tailorId:tailors[1]._id, orderId:orders[2]._id, rating:5, comment:'Sunita ji stitched the most beautiful bridal set. Highly recommended!', customerName:'Priya Sharma' },
      { customerId:customers[2]._id, tailorId:tailors[2]._id, orderId:orders[3]._id, rating:5, comment:'Three-generation mastery shows. Best suit I have ever worn.', customerName:'Meera Joshi' },
    ]);

    console.log('✨ Seed complete!\n');
    console.log('─────────────────────────────────────────────');
    console.log('🔑  Admin    → admin@stitchify.com  / Admin@123');
    console.log('👗  Customer → priya@example.com    / demo1234');
    console.log('🧵  Tailor   → ramesh@tailor.com    / demo1234');
    console.log('─────────────────────────────────────────────\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
