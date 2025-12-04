# Transparent Partners Design System

A comprehensive, portable design system for all Transparent Partners apps and agents.

## 🚀 Quick Start

### 1. Include the CSS
```html
<link rel="stylesheet" href="/styles/design-system.css">
```

### 2. Use the Classes
```html
<button class="tp-btn tp-btn-primary">Primary Button</button>
<div class="tp-card">
  <div class="tp-card-header">Header</div>
  <div class="tp-card-body">Content</div>
</div>
```

## 🎨 Color Palette

### Primary Colors
- `--tp-primary-50` to `--tp-primary-950`: Blue scale
- **Main brand color**: `--tp-primary-600` (#2563eb)

### Secondary Colors
- `--tp-secondary-50` to `--tp-secondary-950`: Gray scale
- **Text color**: `--tp-secondary-900` (#0f172a)
- **Background**: `--tp-secondary-50` (#f8fafc)

### Semantic Colors
- **Success**: `--tp-success` (Green)
- **Warning**: `--tp-warning` (Amber)
- **Error**: `--tp-error` (Red)
- **Info**: `--tp-info` (Blue)

### Usage
```css
/* CSS Custom Properties */
color: var(--tp-primary-600);
background-color: var(--tp-secondary-100);

/* Utility Classes */
.tp-text-primary { color: var(--tp-primary-600); }
.tp-bg-success { background-color: var(--tp-success); }
```

## 🔤 Typography

### Font Families
- **Sans**: `--tp-font-sans` (Inter + system fonts)
- **Mono**: `--tp-font-mono` (JetBrains Mono + system fonts)

### Font Sizes
- `--tp-text-xs`: 0.75rem (12px)
- `--tp-text-sm`: 0.875rem (14px)
- `--tp-text-base`: 1rem (16px)
- `--tp-text-lg`: 1.125rem (18px)
- `--tp-text-xl`: 1.25rem (20px)
- `--tp-text-2xl`: 1.5rem (24px)
- `--tp-text-3xl`: 1.875rem (30px)
- `--tp-text-4xl`: 2.25rem (36px)
- `--tp-text-5xl`: 3rem (48px)
- `--tp-text-6xl`: 3.75rem (60px)

### Font Weights
- `--tp-font-light`: 300
- `--tp-font-normal`: 400
- `--tp-font-medium`: 500
- `--tp-font-semibold`: 600
- `--tp-font-bold`: 700
- `--tp-font-extrabold`: 800

### Usage
```css
/* CSS Custom Properties */
font-size: var(--tp-text-2xl);
font-weight: var(--tp-font-bold);

/* Utility Classes */
.tp-text-2xl { font-size: var(--tp-text-2xl); }
.tp-font-bold { font-weight: var(--tp-font-bold); }
```

## 📏 Spacing System

### Spacing Scale
- `--tp-space-0`: 0
- `--tp-space-1`: 0.25rem (4px)
- `--tp-space-2`: 0.5rem (8px)
- `--tp-space-3`: 0.75rem (12px)
- `--tp-space-4`: 1rem (16px)
- `--tp-space-5`: 1.25rem (20px)
- `--tp-space-6`: 1.5rem (24px)
- `--tp-space-8`: 2rem (32px)
- `--tp-space-10`: 2.5rem (40px)
- `--tp-space-12`: 3rem (48px)
- `--tp-space-16`: 4rem (64px)
- `--tp-space-20`: 5rem (80px)
- `--tp-space-24`: 6rem (96px)
- `--tp-space-32`: 8rem (128px)

### Usage
```css
/* CSS Custom Properties */
padding: var(--tp-space-6);
margin: var(--tp-space-4);

/* Utility Classes */
.tp-p-6 { padding: var(--tp-space-6); }
.tp-m-4 { margin: var(--tp-space-4); }
```

## 🔘 Components

### Buttons

#### Base Button
```html
<button class="tp-btn">Base Button</button>
```

#### Button Variants
```html
<button class="tp-btn tp-btn-primary">Primary</button>
<button class="tp-btn tp-btn-secondary">Secondary</button>
<button class="tp-btn tp-btn-success">Success</button>
<button class="tp-btn tp-btn-outline">Outline</button>
```

#### Button Sizes
```html
<button class="tp-btn tp-btn-primary tp-btn-sm">Small</button>
<button class="tp-btn tp-btn-primary">Default</button>
<button class="tp-btn tp-btn-primary tp-btn-lg">Large</button>
```

### Cards
```html
<div class="tp-card">
  <div class="tp-card-header">Card Header</div>
  <div class="tp-card-body">Card content goes here</div>
  <div class="tp-card-footer">Card footer</div>
</div>
```

### Forms
```html
<label class="tp-label">Email Address</label>
<input type="email" class="tp-input" placeholder="Enter your email">
```

### Navigation
```html
<nav class="tp-nav">
  <a href="/" class="tp-nav-brand">Brand</a>
  <div class="tp-nav-menu">
    <a href="/about" class="tp-nav-link">About</a>
    <a href="/contact" class="tp-nav-link">Contact</a>
  </div>
</nav>
```

### Layout Components
```html
<div class="tp-container">
  <div class="tp-grid tp-grid-cols-1 tp-grid-cols-md-3">
    <div class="tp-feature">Feature 1</div>
    <div class="tp-feature">Feature 2</div>
    <div class="tp-feature">Feature 3</div>
  </div>
</div>
```

### Hero Section
```html
<section class="tp-hero">
  <h1 class="tp-hero-title">Main Title</h1>
  <p class="tp-hero-subtitle">Subtitle text</p>
</section>
```

### Section
```html
<section class="tp-section">
  <h2 class="tp-section-title">Section Title</h2>
  <p class="tp-section-subtitle">Section description</p>
  <!-- Content -->
</section>
```

## 🎯 Utility Classes

### Display
- `.tp-hidden` - `display: none`
- `.tp-block` - `display: block`
- `.tp-inline` - `display: inline`
- `.tp-flex` - `display: flex`
- `.tp-grid` - `display: grid`

### Alignment
- `.tp-items-center` - `align-items: center`
- `.tp-justify-center` - `justify-content: center`
- `.tp-justify-between` - `justify-content: space-between`

### Text Alignment
- `.tp-text-center` - `text-align: center`
- `.tp-text-left` - `text-align: left`
- `.tp-text-right` - `text-align: right`

### Spacing
- `.tp-p-{size}` - Padding utilities
- `.tp-m-{size}` - Margin utilities

### Colors
- `.tp-text-{color}` - Text color utilities
- `.tp-bg-{color}` - Background color utilities

### Borders & Shadows
- `.tp-rounded` - Border radius
- `.tp-shadow-sm` - Small shadow
- `.tp-shadow` - Base shadow
- `.tp-shadow-lg` - Large shadow

### Transitions
- `.tp-transition` - Base transition
- `.tp-transition-fast` - Fast transition
- `.tp-transition-slow` - Slow transition

## 📱 Responsive Design

### Breakpoints
- **sm**: 640px+
- **md**: 768px+
- **lg**: 1024px+
- **xl**: 1280px+

### Container
```css
.tp-container {
  max-width: 100%;        /* Mobile */
  max-width: 640px;       /* sm */
  max-width: 768px;       /* md */
  max-width: 1024px;      /* lg */
  max-width: 1280px;      /* xl */
}
```

### Grid Responsiveness
```html
<div class="tp-grid tp-grid-cols-1 tp-grid-cols-md-2 tp-grid-cols-lg-3">
  <!-- 1 column on mobile, 2 on md, 3 on lg -->
</div>
```

## 🎨 Customization

### Override CSS Variables
```css
:root {
  --tp-primary-600: #your-custom-blue;
  --tp-font-sans: 'Your Font', sans-serif;
}
```

### Extend Components
```css
.tp-btn-custom {
  @extend .tp-btn;
  background-color: var(--tp-accent-purple-600);
}
```

## 📚 Best Practices

### 1. Use CSS Variables for Consistency
```css
/* ✅ Good */
color: var(--tp-primary-600);

/* ❌ Avoid */
color: #2563eb;
```

### 2. Combine Utility Classes
```html
<!-- ✅ Good -->
<button class="tp-btn tp-btn-primary tp-btn-lg">Large Primary Button</button>

<!-- ❌ Avoid -->
<button style="padding: 1.5rem 2rem; background: blue;">Button</button>
```

### 3. Leverage the Grid System
```html
<!-- ✅ Good -->
<div class="tp-grid tp-grid-cols-1 tp-grid-cols-md-3">
  <div class="tp-feature">Feature</div>
</div>

<!-- ❌ Avoid -->
<div style="display: grid; grid-template-columns: repeat(3, 1fr);">
  <div>Feature</div>
</div>
```

### 4. Use Semantic Colors
```css
/* ✅ Good */
.tp-text-success { color: var(--tp-success); }
.tp-bg-error { background-color: var(--tp-error); }

/* ❌ Avoid */
.success-text { color: #22c55e; }
```

## 🔧 Integration

### With Tailwind CSS
The design system can be used alongside Tailwind CSS. The `tp-` prefix prevents conflicts.

### With Other Frameworks
- **React**: Import the CSS file
- **Vue**: Import the CSS file
- **Angular**: Add to angular.json styles array
- **Vanilla JS**: Link in HTML head

### Build Process
```bash
# Copy to your project
cp design-system.css /your-project/styles/

# Or include via CDN (if hosted)
<link rel="stylesheet" href="https://your-domain.com/design-system.css">
```

## 📖 Examples

### Complete Page Layout
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="/styles/design-system.css">
</head>
<body>
  <!-- Navigation -->
  <nav class="tp-nav">
    <a href="/" class="tp-nav-brand">Your App</a>
    <div class="tp-nav-menu">
      <a href="/features" class="tp-nav-link">Features</a>
      <a href="/pricing" class="tp-nav-link">Pricing</a>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="tp-hero">
    <h1 class="tp-hero-title">Welcome to Your App</h1>
    <p class="tp-hero-subtitle">The best solution for your needs</p>
    <button class="tp-btn tp-btn-primary tp-btn-lg">Get Started</button>
  </section>

  <!-- Features Section -->
  <section class="tp-section">
    <h2 class="tp-section-title">Key Features</h2>
    <p class="tp-section-subtitle">Everything you need to succeed</p>
    
    <div class="tp-container">
      <div class="tp-grid tp-grid-cols-1 tp-grid-cols-md-3">
        <div class="tp-feature">
          <div class="tp-feature-icon">🚀</div>
          <h3 class="tp-feature-title">Fast Performance</h3>
          <p class="tp-feature-description">Lightning fast loading times</p>
        </div>
        <div class="tp-feature">
          <div class="tp-feature-icon">🔒</div>
          <h3 class="tp-feature-title">Secure</h3>
          <p class="tp-feature-description">Enterprise-grade security</p>
        </div>
        <div class="tp-feature">
          <div class="tp-feature-icon">📱</div>
          <h3 class="tp-feature-title">Responsive</h3>
          <p class="tp-feature-description">Works on all devices</p>
        </div>
      </div>
    </div>
  </section>
</body>
</html>
```

## 🚀 Migration Guide

### From Custom CSS
1. Replace custom colors with CSS variables
2. Replace custom spacing with design system spacing
3. Replace custom components with design system classes
4. Update typography to use design system scale

### From Other Design Systems
1. Map existing classes to design system equivalents
2. Update color references to use new palette
3. Adjust spacing to match new scale
4. Test responsive behavior

## 📝 Changelog

### Version 1.0.0
- Initial release
- Complete color palette
- Typography system
- Spacing system
- Component library
- Utility classes
- Responsive design support

## 🤝 Contributing

To contribute to the design system:

1. Follow the existing naming conventions
2. Use CSS custom properties for values
3. Include responsive variants
4. Add comprehensive documentation
5. Test across different browsers

## 📄 License

This design system is proprietary to Transparent Partners.

---

**Need Help?** Contact the design team or refer to the examples above.
