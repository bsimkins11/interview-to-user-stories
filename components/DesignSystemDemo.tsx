"use client";

import { useState } from 'react';

export function DesignSystemDemo() {
  const [activeTab, setActiveTab] = useState('buttons');

  return (
    <div className="tp-section">
      <div className="tp-container">
        <h2 className="tp-section-title">Design System Demo</h2>
        <p className="tp-section-subtitle">
          Examples of Transparent Partners Design System components and utilities
        </p>

        {/* Navigation Tabs */}
        <div className="tp-flex tp-justify-center tp-mb-8">
          <div className="tp-flex tp-rounded-lg tp-bg-secondary-100 tp-p-1">
            {['buttons', 'cards', 'forms', 'layout'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tp-px-4 tp-py-2 tp-rounded-md tp-text-sm tp-font-medium tp-transition ${
                  activeTab === tab
                    ? 'tp-bg-white tp-text-secondary-900 tp-shadow-sm'
                    : 'tp-text-secondary-600 hover:tp-text-secondary-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'buttons' && (
          <div className="tp-space-y-6">
            <h3 className="tp-text-2xl tp-font-bold tp-text-secondary-900">Buttons</h3>
            <div className="tp-grid tp-grid-cols-1 tp-grid-cols-md-2 tp-gap-6">
              <div className="tp-space-y-4">
                <h4 className="tp-text-lg tp-font-semibold tp-text-secondary-800">Button Variants</h4>
                <div className="tp-space-y-3">
                  <button className="tp-btn tp-btn-primary">Primary Button</button>
                  <button className="tp-btn tp-btn-secondary">Secondary Button</button>
                  <button className="tp-btn tp-btn-success">Success Button</button>
                  <button className="tp-btn tp-btn-outline">Outline Button</button>
                </div>
              </div>
              <div className="tp-space-y-4">
                <h4 className="tp-text-lg tp-font-semibold tp-text-secondary-800">Button Sizes</h4>
                <div className="tp-space-y-3">
                  <button className="tp-btn tp-btn-primary tp-btn-sm">Small Button</button>
                  <button className="tp-btn tp-btn-primary">Default Button</button>
                  <button className="tp-btn tp-btn-primary tp-btn-lg">Large Button</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="tp-space-y-6">
            <h3 className="tp-text-2xl tp-font-bold tp-text-secondary-900">Cards</h3>
            <div className="tp-grid tp-grid-cols-1 tp-grid-cols-md-3 tp-gap-6">
              <div className="tp-card">
                <div className="tp-card-header">
                  <h4 className="tp-text-lg tp-font-semibold tp-text-secondary-900">Card Header</h4>
                </div>
                <div className="tp-card-body">
                  <p className="tp-text-secondary-600">
                    This is a basic card component with header, body, and footer sections.
                  </p>
                </div>
                <div className="tp-card-footer">
                  <button className="tp-btn tp-btn-primary tp-btn-sm">Action</button>
                </div>
              </div>

              <div className="tp-card">
                <div className="tp-card-body">
                  <div className="tp-text-center">
                    <div className="tp-feature-icon">🚀</div>
                    <h4 className="tp-feature-title">Feature Card</h4>
                    <p className="tp-feature-description">
                      Feature cards are perfect for highlighting key capabilities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="tp-card">
                <div className="tp-card-body">
                  <h4 className="tp-text-lg tp-font-semibold tp-text-secondary-900 tp-mb-3">
                    Simple Card
                  </h4>
                  <p className="tp-text-secondary-600">
                    Sometimes you just need a simple card without extra sections.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="tp-space-y-6">
            <h3 className="tp-text-2xl tp-font-bold tp-text-secondary-900">Forms</h3>
            <div className="tp-max-w-md">
              <form className="tp-space-y-4">
                <div>
                  <label className="tp-label">Email Address</label>
                  <input
                    type="email"
                    className="tp-input"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="tp-label">Message</label>
                  <textarea
                    className="tp-input"
                    rows={4}
                    placeholder="Enter your message"
                  />
                </div>
                <div className="tp-flex tp-gap-3">
                  <button type="submit" className="tp-btn tp-btn-primary">
                    Submit
                  </button>
                  <button type="button" className="tp-btn tp-btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="tp-space-y-6">
            <h3 className="tp-text-2xl tp-font-bold tp-text-secondary-900">Layout & Grid</h3>
            <div className="tp-grid tp-grid-cols-1 tp-grid-cols-md-2 tp-grid-cols-lg-4 tp-gap-6">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="tp-card">
                  <div className="tp-card-body tp-text-center">
                    <div className="tp-text-2xl tp-font-bold tp-text-primary-600 tp-mb-2">
                      {num}
                    </div>
                    <p className="tp-text-secondary-600">
                      Grid item {num} - responsive layout
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="tp-bg-secondary-50 tp-p-6 tp-rounded-lg">
              <h4 className="tp-text-lg tp-font-semibold tp-text-secondary-900 tp-mb-3">
                Container & Spacing
              </h4>
              <p className="tp-text-secondary-600">
                This section demonstrates the container system and consistent spacing utilities.
                The design system provides a cohesive layout framework that scales beautifully
                across all device sizes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

