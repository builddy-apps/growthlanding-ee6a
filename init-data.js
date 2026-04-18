import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'app.db'));
db.pragma('journal_mode = WAL');

// Check if data already exists
const count = db.prepare('SELECT COUNT(*) as count FROM testimonials').get();
if (count.count > 0) {
    console.log('Data already seeded, skipping...');
    db.close();
    process.exit(0);
}

const insertAll = db.transaction(() => {
    // Insert newsletter subscribers
    const insertSubscriber = db.prepare('INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, ?)');
    
    const subscribers = [
        { email: 'sarah.chen@techstartup.io', daysAgo: 28 },
        { email: 'marcus.johnson@digitalagency.com', daysAgo: 25 },
        { email: 'elena.rodriguez@saascompany.com', daysAgo: 23 },
        { email: 'james.obrien@consulting.co', daysAgo: 20 },
        { email: 'priya.patel@healthtech.io', daysAgo: 18 },
        { email: 'david.kim@ecommerce.biz', daysAgo: 15 },
        { email: 'rachel.foster@designstudio.co', daysAgo: 13 },
        { email: 'alex.martinez@fintech.app', daysAgo: 11 },
        { email: 'nikki.chen@marketing.io', daysAgo: 9 },
        { email: 'tom.brown@realestate.com', daysAgo: 7 },
        { email: 'sophia.lee@edtech.org', daysAgo: 5 },
        { email: 'michael.wilson@analytics.dev', daysAgo: 4 },
        { email: 'lisa.anderson@creative.agency', daysAgo: 3 },
        { email: 'chris.taylor@startup.co', daysAgo: 2 },
        { email: 'amy.watson@product.company', daysAgo: 1 },
        { email: 'ryan.thompson@growth.io', daysAgo: 0 }
    ];
    
    for (const sub of subscribers) {
        const date = new Date(Date.now() - sub.daysAgo * 86400000).toISOString();
        insertSubscriber.run(sub.email, date);
    }
    
    // Insert contact submissions
    const insertContact = db.prepare('INSERT INTO contact_submissions (name, email, message, created_at) VALUES (?, ?, ?, ?)');
    
    const contacts = [
        {
            name: 'Jennifer Adams',
            email: 'j.adams@enterprise.com',
            message: 'We are looking for a solution to improve our landing page conversion rates. Your platform looks promising. Can we schedule a demo to discuss enterprise pricing options?',
            daysAgo: 27
        },
        {
            name: 'Robert Kim',
            email: 'robert.kim@startup.io',
            message: 'I am building a SaaS product and need a high-converting landing page. What kind of conversion rate improvements have your clients seen? Would love to see some case studies.',
            daysAgo: 24
        },
        {
            name: 'Michelle Torres',
            email: 'm.torres@agency.co',
            message: 'We manage multiple client websites and are interested in your platform for our agency. Do you offer white-label solutions or agency discounts for multiple accounts?',
            daysAgo: 21
        },
        {
            name: 'Daniel Park',
            email: 'daniel.p@techcompany.com',
            message: 'We are currently evaluating different landing page builders for our product launch next quarter. Your testimonials are impressive. Can you provide more details about the Pro plan features?',
            daysAgo: 17
        },
        {
            name: 'Amanda Foster',
            email: 'amanda.f@ecommerce.store',
            message: 'I run an online store and my current landing page has a 2% conversion rate. I am looking to improve this significantly. How quickly can I expect to see results with your platform?',
            daysAgo: 14
        },
        {
            name: 'Kevin Mitchell',
            email: 'k.mitchell@saas.dev',
            message: 'Just signed up for the Starter plan and I am already impressed with the interface. Quick question - is it possible to A/B test different hero section designs?',
            daysAgo: 10
        },
        {
            name: 'Laura Chen',
            email: 'laura.chen@marketing.co',
            message: 'Our marketing team loves the templates you offer. We are considering upgrading to the Pro plan. Can you tell me more about the priority support and custom integrations?',
            daysAgo: 8
        },
        {
            name: 'Brandon Lee',
            email: 'b.lee@digitalnomad.io',
            message: 'I am a freelance consultant helping small businesses improve their online presence. Do you have an affiliate or partner program? I would love to recommend your platform to my clients.',
            daysAgo: 6
        },
        {
            name: 'Samantha Wright',
            email: 's.wright@healthcare.org',
            message: 'We need to create a landing page for our patient enrollment campaign. Your forms and lead capture features look exactly like what we need. Can you assure HIPAA compliance for collected data?',
            daysAgo: 4
        },
        {
            name: 'Jason Miller',
            email: 'jason.m@fintech.app',
            message: 'Impressed by the performance metrics on your landing page. We are launching a new financial product and need a conversion-optimized page. What is the typical implementation timeline?',
            daysAgo: 2
        },
        {
            name: 'Emily Rodriguez',
            email: 'emily.r@coaching.biz',
            message: 'I am a business coach looking to build my email list. Your newsletter signup feature caught my attention. Can it integrate with popular email marketing platforms like Mailchimp or ConvertKit?',
            daysAgo: 1
        },
        {
            name: 'Nathan Brooks',
            email: 'n.brooks@realestate.com',
            message: 'We are a real estate agency looking to generate more leads through our website. Your testimonial section is very convincing. Would we be able to showcase our client reviews in a similar format?',
            daysAgo: 0
        }
    ];
    
    for (const contact of contacts) {
        const date = new Date(Date.now() - contact.daysAgo * 86400000).toISOString();
        insertContact.run(contact.name, contact.email, contact.message, date);
    }
    
    // Insert testimonials
    const insertTestimonial = db.prepare(`
        INSERT INTO testimonials (name, role, company, quote, avatar_url, rating, featured, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const testimonials = [
        {
            name: 'Rebecca Zhang',
            role: 'Head of Growth',
            company: 'TechScale Solutions',
            quote: 'Our conversion rate jumped from 3.2% to 8.7% within the first month of using GrowthLanding. The animated hero section alone increased our signups by 150%. The ROI has been incredible.',
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 1,
            daysAgo: 30
        },
        {
            name: 'Marcus Thompson',
            role: 'Digital Marketing Manager',
            company: 'CloudPeak SaaS',
            quote: 'We tested multiple landing page builders before settling on GrowthLanding. The attention to detail in the animations and micro-interactions sets it apart. Our bounce rate dropped by 40% after implementing the scroll-triggered effects.',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 1,
            daysAgo: 28
        },
        {
            name: 'Sarah Mitchell',
            role: 'Founder & CEO',
            company: 'Zenith Ecommerce',
            quote: 'The testimonials carousel feature helped us showcase our customer reviews beautifully. Since launching with GrowthLanding, our product page conversions have increased by 92%. The pricing tiers layout is brilliant for upselling.',
            avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 1,
            daysAgo: 25
        },
        {
            name: 'David Okafor',
            role: 'VP of Marketing',
            company: 'Nexus Analytics',
            quote: 'GrowthLanding transformed our lead generation strategy. The contact form with real-time validation increased our form completion rate by 65%. The dark mode option is a nice touch that our users love.',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 1,
            daysAgo: 22
        },
        {
            name: 'Julia Fernandez',
            role: 'Creative Director',
            company: 'Luminous Design Co.',
            quote: 'As a design agency, we are very particular about aesthetics. GrowthLanding offers the perfect balance of beautiful design and conversion optimization. The smooth scroll navigation is chef\'s kiss.',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 1,
            daysAgo: 20
        },
        {
            name: 'Ryan Patel',
            role: 'Product Manager',
            company: 'Fintech Innovations',
            quote: 'We saw a 78% increase in newsletter signups after implementing the subscription form. The email validation and duplicate checking features save us from low-quality leads. Highly recommend for any fintech startup.',
            avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 1,
            daysAgo: 18
        },
        {
            name: 'Emily Watson',
            role: 'Marketing Specialist',
            company: 'GreenLeaf Wellness',
            quote: 'The mobile responsiveness is outstanding. Over 60% of our traffic comes from mobile devices, and GrowthLanding handles it perfectly. The touch swipe support for the testimonials carousel is a great feature.',
            avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            rating: 4,
            featured: 0,
            daysAgo: 15
        },
        {
            name: 'Michael Torres',
            role: 'Growth Hacker',
            company: 'RapidScale AI',
            quote: 'We run multiple campaigns and need landing pages that convert. GrowthLanding has become our go-to solution. The stat counters with easing animations create a powerful social proof effect that builds instant trust.',
            avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 0,
            daysAgo: 12
        },
        {
            name: 'Angela Kim',
            role: 'Ecommerce Director',
            company: 'StyleVault',
            quote: 'The floating navbar with scroll transition gives our landing page a premium feel. Combined with the animated gradient hero, our brand perception improved dramatically. Sales from our landing page are up 125%.',
            avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 0,
            daysAgo: 10
        },
        {
            name: 'Chris Johnson',
            role: 'Lead Developer',
            company: 'CodeCraft Studios',
            quote: 'From a technical perspective, I appreciate the clean code and performance optimization. The lazy loading of testimonials from the API and the Intersection Observer for animations show real engineering thought. Page load time is under 1.5 seconds.',
            avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
            rating: 4,
            featured: 0,
            daysAgo: 8
        },
        {
            name: 'Patricia Nguyen',
            role: 'Chief Revenue Officer',
            company: 'B2B Dynamics',
            quote: 'Our enterprise clients love the professional look. The three-tier pricing layout makes it easy for prospects to understand our offering. Since switching to GrowthLanding, our average deal size increased by 34%.',
            avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 0,
            daysAgo: 6
        },
        {
            name: 'Kevin Wright',
            role: 'Startup Advisor',
            company: 'VentureLaunch',
            quote: 'I recommend GrowthLanding to every startup I advise. The ease of setup combined with the conversion-focused design makes it the perfect tool for early-stage companies looking to validate their ideas and attract investors.',
            avatar_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
            rating: 4,
            featured: 0,
            daysAgo: 4
        },
        {
            name: 'Hannah Rodriguez',
            role: 'Content Strategist',
            company: 'MediaFlow Digital',
            quote: 'The typewriter effect on the headline is a game-changer for engagement. Our time-on-page metrics improved by 45% because visitors actually stop to read the hero section now. Simple but incredibly effective.',
            avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 0,
            daysAgo: 2
        },
        {
            name: 'Alex Petrov',
            role: 'Conversion Rate Optimizer',
            company: 'DataDriven Marketing',
            quote: 'I have optimized hundreds of landing pages, and GrowthLanding gets the fundamentals right. The micro-interactions, loading states, and form validation all contribute to a seamless user experience that converts.',
            avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 0,
            daysAgo: 1
        },
        {
            name: 'Lisa Chang',
            role: 'User Experience Lead',
            company: 'Future Interfaces',
            quote: 'The accessibility considerations are impressive. The prefers-reduced-motion support and proper semantic HTML show that the developers care about inclusive design. This is rare to find in landing page templates.',
            avatar_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
            rating: 5,
            featured: 0,
            daysAgo: 0
        }
    ];
    
    for (const testimonial of testimonials) {
        const date = new Date(Date.now() - testimonial.daysAgo * 86400000).toISOString();
        insertTestimonial.run(
            testimonial.name,
            testimonial.role,
            testimonial.company,
            testimonial.quote,
            testimonial.avatar_url,
            testimonial.rating,
            testimonial.featured,
            date
        );
    }
});

insertAll();

// Get final counts
const subscriberCount = db.prepare('SELECT COUNT(*) as count FROM newsletter_subscribers').get().count;
const contactCount = db.prepare('SELECT COUNT(*) as count FROM contact_submissions').get().count;
const testimonialCount = db.prepare('SELECT COUNT(*) as count FROM testimonials').get().count;
const featuredCount = db.prepare('SELECT COUNT(*) as count FROM testimonials WHERE featured = 1').get().count;

db.close();

console.log('✅ Database seeded successfully!');
console.log(`Seeded: ${subscriberCount} newsletter subscribers, ${contactCount} contact submissions, ${testimonialCount} testimonials (${featuredCount} featured)`);