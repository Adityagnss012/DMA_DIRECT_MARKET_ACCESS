# 🌱 Direct Market Access

A comprehensive full-stack web application that connects farmers directly with buyers, eliminating middlemen and creating a more sustainable food system. Built with modern technologies and designed for production use.

![Direct Market Access](https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=800)

## 🚀 Features

### 👨‍🌾 For Farmers
- **Product Management**: Add, edit, and manage agricultural products with rich details
- **Camera Integration**: Take photos directly with device camera for product listings
- **Order Management**: Track and manage incoming orders with real-time updates
- **Messaging System**: Communicate directly with buyers through integrated chat
- **Voice Messages**: Send voice messages for better communication
- **Dashboard Analytics**: View sales statistics and product performance
- **Profile Management**: Comprehensive profile with business information

### 🛒 For Buyers
- **Product Discovery**: Browse fresh produce with advanced search and filtering
- **Direct Communication**: Chat with farmers about products and orders
- **Secure Ordering**: Place orders with integrated payment processing
- **Order Tracking**: Real-time order status updates and notifications
- **Escrow Payments**: Secure payment system that protects both parties
- **Product Reviews**: Rate and review products and farmers

### 🔧 Technical Features
- **Real-time Notifications**: Instant updates for orders, messages, and activities
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Dark Mode Support**: Complete dark/light theme with system preference detection
- **Multi-language Support**: English and Spanish language options
- **Progressive Web App**: Installable with offline capabilities
- **Advanced Security**: Row-level security with Supabase authentication
- **File Upload**: Support for images with camera capture and file selection
- **Voice Recording**: Built-in voice message recording and playback

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Hook Form** - Efficient form handling
- **Date-fns** - Modern date utility library
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security (RLS)** - Database-level security
- **Real-time Subscriptions** - Live data updates
- **Edge Functions** - Serverless functions for API endpoints
- **Authentication** - Secure user authentication and authorization

### Payment Processing
- **Stripe** - Secure payment processing
- **Escrow System** - Payment protection for both parties
- **Multiple Payment Methods** - Credit cards, debit cards, bank transfers

### Additional Integrations
- **Camera API** - Device camera access for product photos
- **MediaRecorder API** - Voice message recording
- **Geolocation API** - Location-based features
- **Push Notifications** - Real-time alerts

## 📱 Screenshots

### Homepage
Beautiful landing page with hero section, features, and testimonials.

### Farmer Dashboard
Comprehensive dashboard for managing products, orders, and communications.

### Buyer Dashboard
Intuitive interface for browsing products, placing orders, and tracking deliveries.

### Messaging System
Real-time chat with voice messages and product context.

### Mobile Responsive
Fully optimized for mobile devices with touch-friendly interfaces.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adityagnss/direct-market-access.git
   cd direct-market-access
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the migration files in `/supabase/migrations/` in order
   - Enable Row Level Security on all tables
   - Configure authentication settings

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📊 Database Schema

### Core Tables
- **profiles** - User profiles with role-based access (farmer/buyer)
- **products** - Agricultural products with details and inventory
- **orders** - Order management with status tracking
- **messages** - Real-time messaging system
- **notifications** - System notifications and alerts

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure authentication with Supabase Auth
- Data validation and sanitization

## 🔐 Security Features

- **Authentication**: Secure email/password authentication
- **Authorization**: Role-based access control (farmer/buyer)
- **Data Protection**: Row-level security in database
- **Payment Security**: PCI-compliant payment processing with Stripe
- **Input Validation**: Comprehensive client and server-side validation
- **HTTPS**: Secure data transmission
- **CORS**: Proper cross-origin resource sharing configuration

## 🌍 Deployment

### Frontend Deployment (Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard
4. Set up custom domain (optional)

### Backend (Supabase)
- Supabase handles backend deployment automatically
- Configure production environment variables
- Set up custom domain for API (optional)
- Enable SSL certificates

### Environment Configuration
```env
# Production Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

## 📈 Performance Optimizations

- **Code Splitting**: Lazy loading of routes and components
- **Image Optimization**: Responsive images with proper sizing
- **Caching**: Efficient caching strategies for API calls
- **Bundle Optimization**: Tree shaking and minification
- **Database Indexing**: Optimized database queries with proper indexes
- **CDN**: Content delivery network for static assets

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/user` - Get current user

### Product Endpoints
- `GET /api/products` - List all products
- `POST /api/products` - Create new product (farmers only)
- `PUT /api/products/:id` - Update product (farmers only)
- `DELETE /api/products/:id` - Delete product (farmers only)

### Order Endpoints
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status
- `GET /api/orders/:id` - Get order details

### Message Endpoints
- `GET /api/messages` - List conversations
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Mark message as read

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Maintain consistent code formatting with Prettier
- Follow conventional commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aditya Gnss** (@adityagnss)
- Email: adityagnss@gmail.com
- Phone: +91 7287094511
- Location: Andhra Pradesh, India

## 🙏 Acknowledgments

- **Supabase** - For providing an excellent backend-as-a-service platform
- **Stripe** - For secure and reliable payment processing
- **Tailwind CSS** - For the beautiful and responsive design system
- **React Community** - For the amazing ecosystem and tools
- **Open Source Contributors** - For the libraries and tools that made this possible

## 📞 Support

If you have any questions or need support:

- 📧 Email: adityagnss@gmail.com
- 📱 Phone: +91 7287094511
- 🐛 Issues: [GitHub Issues](https://github.com/adityagnss/direct-market-access/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/adityagnss/direct-market-access/discussions)

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-vendor marketplace
- [ ] Subscription-based pricing
- [ ] AI-powered product recommendations
- [ ] Blockchain-based supply chain tracking
- [ ] IoT integration for smart farming
- [ ] Weather-based insights
- [ ] Logistics and delivery management
- [ ] Multi-currency support

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added messaging system and voice messages
- **v1.2.0** - Camera integration and file uploads
- **v1.3.0** - Enhanced notifications and real-time updates
- **v2.0.0** - Complete UI/UX redesign and performance improvements

---

**Built with Bolt.new by @adityagnss**

*Connecting farmers directly with buyers for a sustainable future.*
