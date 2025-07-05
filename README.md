# Personal Finance Visualizer

A modern, feature-rich personal finance tracking application built with Next.js, TypeScript, and Tailwind CSS. Track your income, expenses, and budgets with beautiful visualizations and smart insights.

![Personal Finance Visualizer](https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

### 📊 Dashboard & Analytics
- **Comprehensive Dashboard**: Get an overview of your financial health at a glance
- **Interactive Charts**: Visualize your income and expenses with beautiful charts
- **Category Breakdown**: See where your money goes with detailed pie charts
- **Monthly Trends**: Track your financial patterns over time

### 💰 Transaction Management
- **Easy Transaction Entry**: Quick and intuitive form to add income and expenses
- **Smart Categorization**: Predefined categories for both income and expenses
- **Search & Filter**: Find transactions quickly with powerful search and filtering
- **Edit & Delete**: Full CRUD operations for all your transactions

### 🎯 Budget Management
- **Monthly Budgets**: Set spending limits for different categories
- **Budget vs Actual**: Compare your planned vs actual spending
- **Visual Progress**: See your budget usage with progress bars
- **Smart Alerts**: Get notified when approaching or exceeding budget limits

### 🔔 Smart Insights
- **Budget Alerts**: Real-time notifications for budget overruns
- **Spending Insights**: AI-powered insights about your spending patterns
- **Trend Analysis**: Understand your financial habits over time
- **Recommendations**: Get suggestions to improve your financial health

### 📱 User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Clean Interface**: Modern, intuitive design focused on usability
- **Local Storage**: Your data is stored locally in your browser
- **Fast Performance**: Built with Next.js for optimal speed

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-finance-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
npm run build
# or
yarn build
```

The application will be built as a static export in the `out` directory, ready for deployment to any static hosting service.

## 🏗️ Tech Stack

### Frontend
- **Next.js 13** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icon library

### Charts & Visualization
- **Recharts** - Composable charting library for React
- **Custom Components** - Purpose-built visualization components

### State Management
- **React Hooks** - useState, useEffect for local state
- **Local Storage** - Browser storage for data persistence

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and Tailwind config
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── budget-alerts.tsx # Budget alert notifications
│   ├── budget-comparison-chart.tsx # Budget vs actual chart
│   ├── budget-form.tsx   # Budget creation/editing form
│   ├── budget-list.tsx   # Budget management interface
│   ├── budget-status-indicator.tsx # Budget status badges
│   ├── category-pie-chart.tsx # Category breakdown charts
│   ├── dashboard-summary.tsx # Main dashboard overview
│   ├── expense-chart.tsx # Monthly expense/income chart
│   ├── spending-insights.tsx # AI-powered insights
│   ├── transaction-form.tsx # Transaction entry form
│   └── transaction-list.tsx # Transaction management
├── types/                 # TypeScript type definitions
│   └── transaction.ts     # Core data types
├── lib/                   # Utility functions
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for main actions and highlights
- **Success**: Green for positive values and confirmations
- **Warning**: Yellow/Amber for alerts and warnings
- **Error**: Red for negative values and errors
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Headings**: Inter font with gradient text effects
- **Body**: Inter font with optimized line heights
- **UI Elements**: Consistent sizing and spacing

### Components
- **Cards**: Elevated design with subtle shadows
- **Buttons**: Multiple variants (primary, secondary, ghost)
- **Forms**: Clean inputs with validation states
- **Charts**: Consistent color scheme and styling

## 📊 Data Models

### Transaction
```typescript
interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
}
```

### Budget
```typescript
interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM format
}
```

## 🔧 Configuration

### Categories
The application comes with predefined categories:

**Expense Categories:**
- Food & Dining, Transportation, Shopping, Entertainment
- Bills & Utilities, Healthcare, Education, Travel
- Personal Care, Home & Garden, Insurance, Investments, Other

**Income Categories:**
- Salary, Freelance, Business, Investments
- Rental Income, Gifts, Refunds, Other

### Customization
You can easily customize categories by modifying the constants in `types/transaction.ts`.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the icon library
- [Recharts](https://recharts.org/) for the charting library
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and TypeScript**