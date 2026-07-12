import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://sameetpisal_db_user:LGR6YYBQLe8TsK10@ac-tj3r5sj-shard-00-00.fk8rple.mongodb.net:27017,ac-tj3r5sj-shard-00-01.fk8rple.mongodb.net:27017,ac-tj3r5sj-shard-00-02.fk8rple.mongodb.net:27017/?ssl=true&replicaSet=atlas-srlk7g-shard-0&authSource=admin&appName=Cluster0';

const indicatorSchema = new mongoose.Schema({
  name: String,
  slug: String,
  shortDescription: String,
  description: String,
  price: Number,
  pricing: Array,
  category: String,
  tradingStyle: String,
  image: String,
  thumbnails: Array,
  capabilities: Array,
  isActive: { type: Boolean, default: true }
});

const Indicator = mongoose.models.Indicator || mongoose.model('Indicator', indicatorSchema);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');
    
    const exists = await Indicator.findOne({ slug: 'smc-pro' });
    if (!exists) {
      await Indicator.create({
        name: 'SMC Pro',
        slug: 'smc-pro',
        shortDescription: 'Institutional-grade Smart Money Concepts toolkit.',
        description: 'Advanced non-repainting order blocks and FVGs.',
        price: 49,
        pricing: [
          { planType: 'monthly', price: 49 },
          { planType: 'quarterly', price: 129 },
          { planType: 'yearly', price: 470 },
          { planType: 'lifetime', price: 999 }
        ],
        category: 'smc',
        tradingStyle: 'day',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4EWRroMWKoBCihEfcAKmhKkhYqWYjaRJJfb3ZvGd0Yit8vrRG8hb7DtvcAnvPK97U8rnOYkjCbPcPB3-GkxcACdGN2p1pa4OIw7nDxBBWY5i4F4X6-i_oDUgbUMQz4PN4gAvhF8hBEO_ZUuxygG0-DkSKiWH5leSwCtdAAXH1MTaqaLu1UkDNxRFMac73ZlRESqxbNQp3dnnTC0kFGyYvm5YF3pQpAn7yh77O5E04OcrAdp99Hq-I-S7H9wCSgQpey2N23SGL1hM',
        isActive: true
      });
      console.log('Successfully inserted SMC Pro into database!');
    } else {
      console.log('SMC Pro already exists in database.');
    }
  } catch (err) {
    console.error('Error seeding DB:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
