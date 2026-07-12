import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import User from './models/User.js';
import Indicator from './models/Indicator.js';
import BlogPost from './models/BlogPost.js';
import FAQ from './models/FAQ.js';
import DocArticle from './models/DocArticle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elvaris';

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB. Clearing existing collections...');

    await User.deleteMany({});
    await Indicator.deleteMany({});
    await BlogPost.deleteMany({});
    await FAQ.deleteMany({});
    await DocArticle.deleteMany({});

    console.log('Collections cleared. Seeding Admin User...');
    
    // Create admin user
    const admin = new User({
      name: 'Elvaris Admin',
      email: 'admin@elvaris.com',
      passwordHash: 'adminpassword123', // Will be hashed by pre-save hook
      role: 'admin',
      isEmailVerified: true
    });
    await admin.save();
    console.log('Admin user seeded successfully (admin@elvaris.com / adminpassword123).');

    // Seed Indicators
    console.log('Seeding Indicators...');
    const smcPro = new Indicator({
      name: 'Smart Money Concepts (SMC) Pro',
      slug: 'smc-pro',
      shortDescription: 'Advanced liquidity sweeps, order blocks, FVG, BOS, and CHOCH mapping tool for MTF analysis.',
      description: 'The Elvaris Smart Money Concepts (SMC) Pro is a premium charting package designed to map market structure on autopilot. It automatically highlights key liquidity points, identifies mitigation zones (Order Blocks & Breaker Blocks), and plots Fair Value Gaps (FVG) in real-time across multiple timeframes. Formulated for professional day traders, scalpers, and swing traders.',
      category: ['Crypto', 'Forex', 'Gold', 'Indices'],
      tradingStyle: ['Scalping', 'Swing', 'Day Trading'],
      bannerImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
      features: [
        'Automatic Break of Structure (BOS) & Change of Character (CHOCH) mapping',
        'Real-time mitigation tracking for Premium/Discount Order Blocks',
        'Multi-Timeframe (MTF) structural analysis overlays',
        'Volume-weighted Fair Value Gaps (FVG) and Liquidity Sweeps detections',
        'Customizable push/webhook alerts on structural changes'
      ],
      versionHistory: [
        { version: '1.0.0', notes: 'Initial Release' },
        { version: '1.1.0', notes: 'Added Multi-Timeframe analysis overlays and structural validation alerts' }
      ],
      pricing: [
        { planType: 'monthly', price: 49 },
        { planType: 'quarterly', price: 119 },
        { planType: 'yearly', price: 299 },
        { planType: 'lifetime', price: 599 }
      ],
      isActive: true
    });

    const volumeProfile = new Indicator({
      name: 'Volume Profile & Range Suite',
      slug: 'volume-profile-suite',
      shortDescription: 'Institutional volume profile tools mapping Point of Control (POC), Value Area (VA), and Volume Nodes.',
      description: 'The Elvaris Volume Profile Suite compiles volume profiles on a session, daily, or weekly basis to help you trace institutional auction points. Locate where high and low volume nodes sit, discover the true Point of Control (POC), and use Value Area limits to confirm market entry coordinates with statistical edge.',
      category: ['Crypto', 'Forex', 'Indices'],
      tradingStyle: ['Swing', 'Day Trading'],
      bannerImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop',
      features: [
        'Dynamic Session & Visible Range Volume Profile charts',
        'Automatic Point of Control (POC) tracing with historical projection lines',
        'Value Area (VA) 70% bounds mapping',
        'High Volume Nodes (HVN) and Low Volume Nodes (LVN) detection triggers',
        'Volume-weighted Average Price (VWAP) integration overlays'
      ],
      versionHistory: [
        { version: '1.0.0', notes: 'Initial release' }
      ],
      pricing: [
        { planType: 'monthly', price: 39 },
        { planType: 'yearly', price: 249 }
      ],
      isActive: true
    });

    await smcPro.save();
    await volumeProfile.save();
    console.log('Indicators seeded.');

    // Seed Blog Posts
    console.log('Seeding Blog Posts...');
    const blog1 = new BlogPost({
      title: 'The Ultimate Guide to Trading SMC with Order Blocks',
      slug: 'ultimate-guide-smc-order-blocks',
      summary: 'Learn how to identify and validate high-probability Order Blocks to capture explosive movements in Gold (XAU/USD) and FX.',
      content: `## What is a Smart Money Order Block?

An **Order Block (OB)** represents a zone where institutional traders have placed massive buy or sell orders. When price returns to these zones, it often mitigates (tests) the orders, initiating a powerful trend reversal.

### How to Validate a High-Probability Order Block

To ensure you are trading institutional blocks and not retail support/resistance, check for these three rules:
1. **The Sweep:** The block must have swept previous liquidity (e.g. taken out equal highs/lows) before moving.
2. **Displacement:** The movement away from the block must be aggressive, leaving behind **Fair Value Gaps (FVG)**.
3. **BOS/CHOCH:** The movement must break structural points to confirm trend change.

### Step-by-Step Execution Plan
* Locate the last down-candle before a massive bullish displacement (for buy setups).
* Wait for price to pull back to the 50% equilibrium level of the block.
* Enter on mitigation, placing the stop loss slightly below the invalidation point (low of the block).
* Target a minimum 1:2 risk-to-reward ratio.`,
      category: 'Gold Strategies',
      bannerImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
      author: admin._id,
      status: 'published',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    });

    const blog2 = new BlogPost({
      title: 'Why Risk-to-Reward Ratio is the Only Metric That Matters',
      slug: 'why-risk-to-reward-matters',
      summary: 'Discover the mathematics of profitability and why a 40% win rate can make you a millionaire with a proper 1:3 R:R.',
      content: `## The Retail Myth: Win Rate is King

Many beginner traders focus on finding a strategy with a 90% win rate. However, professional prop-firm traders understand that win rate alone is meaningless without the context of **Risk-to-Reward (R:R)**.

### The Mathematics of Profitability
Let's compare two traders who make 10 trades:

* **Trader A (Win Rate: 80%, R:R: 1:0.5)**
  * 8 wins x $50 = +$400
  * 2 losses x $100 = -$200
  * **Net Profit: +$200**

* **Trader B (Win Rate: 40%, R:R: 1:3)**
  * 4 wins x $300 = +$1200
  * 6 losses x $100 = -$600
  * **Net Profit: +$600**

As you can see, Trader B made three times the profit with half the win rate because their gains were larger than their losses.

### Actionable Tips
1. Never enter a trade where the target is smaller than the stop loss.
2. Set hard rules to move your stop loss to break-even once price hits 1R.
3. Keep logs using trading journals to track your average R:R.`,
      category: 'Trading Psychology',
      bannerImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop',
      author: admin._id,
      status: 'published',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) // 1 day ago
    });

    await blog1.save();
    await blog2.save();
    console.log('Blog posts seeded.');

    // Seed FAQs
    console.log('Seeding FAQs...');
    const faqs = [
      {
        question: 'How do I get access to the indicators after paying?',
        answer: 'Upon completing your cryptocurrency payment, you will be prompted to enter your TradingView username. Our system will queue your username, and access is granted within 5 to 15 minutes. You will find the indicator in your TradingView chart under "Invite-only scripts".',
        category: 'TradingView',
        order: 1
      },
      {
        question: 'Which cryptocurrencies do you accept?',
        answer: 'We accept Bitcoin (BTC), Ethereum (ETH), USDT (ERC20/TRC20), BNB, Solana (SOL), and Litecoin (LTC) via our payment processor NOWPayments.',
        category: 'Crypto Payments',
        order: 2
      },
      {
        question: 'What is your refund policy?',
        answer: 'Because our indicators are invite-only source scripts distributed immediately, we do not offer refunds once access has been provisioned. We encourage reviewing performance sheets and guides prior to purchasing.',
        category: 'Refunds',
        order: 3
      },
      {
        question: 'Do these indicators repaint?',
        answer: 'Absolutely not. All structural points (BOS, CHOCH) and block mitigation levels print on candle CLOSE and remain locked. We value accuracy and statistics above marketing gains.',
        category: 'Updates',
        order: 4
      },
      {
        question: 'How do I set up alerts?',
        answer: 'Right-click the indicator on your TradingView chart and select "Add Alert". You can choose to trigger alerts on BOS/CHOCH breaks, FVG mitigation, or liquidity sweeps. These can be pushed to email, Telegram, or discord webhooks.',
        category: 'Alerts',
        order: 5
      }
    ];

    await FAQ.insertMany(faqs);
    console.log('FAQs seeded.');

    // Seed Doc Articles
    console.log('Seeding Documentation Articles...');
    const doc1 = new DocArticle({
      title: 'Installing Indicators on TradingView',
      slug: 'installing-indicators-tradingview',
      content: `# How to Install Your Indicators

Once your payment is confirmed and your username is authorized, follow these steps to add the script to your chart:

### Step 1: Open TradingView
Navigate to [TradingView](https://www.tradingview.com) and open any asset chart (e.g., BTCUSD).

### Step 2: Access Indicators Menu
Click the **"Indicators"** button located in the top menu bar of your chart interface.

### Step 3: Check "Invite-Only Scripts"
Look for the **"Invite-only scripts"** tab on the left sidebar. If you do not see this tab, verify that you provided the correct username under your Elvaris Profile.

### Step 4: Add to Chart
Click the indicator name (e.g. **"Elvaris SMC Pro"**). The script will automatically compute and overlay onto your candles. You can click the **Star** icon to favorite it for faster access.`,
      category: 'Installation',
      order: 1
    });

    const doc2 = new DocArticle({
      title: 'Configuring Alerts and Webhooks',
      slug: 'configuring-alerts-webhooks',
      content: `# Setting Up Alerts

Never miss a trade setup by configuring TradingView alerts directly to your mobile phone or Discord.

### Adding an Alert
1. Apply the indicator to your chart.
2. Click the **"Clock"** icon in the right-side toolbar, or click the **"Three Dots"** next to the indicator name on the chart and click **"Add Alert on..."**.
3. Select your Condition:
   - **BOS Bullish / Bearish**
   - **Liquidity Sweep**
   - **FVG Mitigation**
4. Set Action: **"Once Per Bar Close"** to prevent false signals.
5. In the message box, customize the alert text or leave the default.

### Routing to Discord/Telegram via Webhooks
1. Under the **Notifications** tab in the alert box, tick **"Webhook URL"**.
2. Paste your custom bot webhook link.
3. Save the alert. TradingView will now automatically forward signals when conditions mitigation matches.`,
      category: 'Alerts',
      order: 2
    });

    await doc1.save();
    await doc2.save();
    console.log('Docs seeded.');

    console.log('\n========================================');
    console.log('  Database Seeding Completed Successfully!  ');
    console.log('========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
