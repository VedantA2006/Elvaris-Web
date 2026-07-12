import connectDB from './db.js';
import VipTier from './models/VipTier.js';

if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://sameetpisal_db_user:LGR6YYBQLe8TsK10@ac-tj3r5sj-shard-00-00.fk8rple.mongodb.net:27017,ac-tj3r5sj-shard-00-01.fk8rple.mongodb.net:27017,ac-tj3r5sj-shard-00-02.fk8rple.mongodb.net:27017/?ssl=true&replicaSet=atlas-srlk7g-shard-0&authSource=admin&appName=Cluster0';
}

async function seedVip() {
  try {
    console.log('Connecting to MongoDB via connectDB()...');
    await connectDB();

    console.log('Checking for existing VIP Tiers...');
    const existingCount = await VipTier.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing VIP Tiers. Clearing to seed default tier...`);
      await VipTier.deleteMany({});
    }

    const defaultTier = new VipTier({
      name: 'Institutional VIP Pass',
      slug: 'institutional-vip-pass',
      description: 'Full institutional quantitative community access, real-time algorithmic signals stream, and private macro liquidity maps.',
      entryFeeUsd: 499,
      billingCycle: 'one_time',
      benefits: [
        'Live Institutional Alpha Feed & SMC Orderflow Maps',
        'Direct Discord & Hub Chat with Senior Quant Engineers',
        'Private Weekly Macro Livestreams & Backtest Code Drops',
        'Early Invitation & Beta Access to All New TradingView Indicators',
        'Lifetime One-Time Entry — Zero Recurring Fees'
      ],
      isActive: true
    });

    await defaultTier.save();
    console.log('Successfully seeded default Institutional VIP Pass tier:', defaultTier.name);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding VIP Tier:', error);
    process.exit(1);
  }
}

seedVip();
