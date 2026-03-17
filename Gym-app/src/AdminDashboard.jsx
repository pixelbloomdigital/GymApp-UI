import React, { useState, useEffect } from "react";

const USERS_API = "http://localhost:3001/users";
const MEMBERSHIP_API = "http://localhost:3001/memberships";

const adminStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  :root {
    --primary-gradient: linear-gradient(135deg, #3e0994 0%, #98cfff 100%);
    --secondary-gradient: linear-gradient(135deg, #98cfff 0%, #3e0994 100%);
    --dark-bg: #1A1A1D;
    --card-bg: rgba(255, 255, 255, 0.95);
    --sidebar-bg: #1A1A1D;
    --text-light: #ffffff;
    --text-gray: #98cfff;
    --accent-blue: #3e0994;
    --accent-light-blue: #98cfff;
    --success-green: #22c55e;
    --border-color: #3e0994;
    --light-bg: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 50%, #dce7ff 100%);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Poppins', sans-serif;
    background: var(--light-bg);
    color: var(--text-light);
  }

  .admin-container {
    min-height: 100vh;
    position: relative;
    background: var(--light-bg);
  }

  .admin-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(62, 9, 148, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(152, 207, 255, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(62, 9, 148, 0.03) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .admin-sidebar {
    width: 280px;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border-color);
    position: fixed;
    height: 100vh;
    left: 0;
    top: 0;
    z-index: 100;
    box-shadow: 4px 0 20px rgba(62, 9, 148, 0.15);
    display: flex;
    flex-direction: column;
    transition: left 0.3s ease;
  }

  .admin-sidebar.open {
    left: 0;
  }

  .sidebar-header {
    padding: 2rem 1.5rem;
    border-bottom: 1px solid rgba(62, 9, 148, 0.3);
  }

  .sidebar-title {
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: 1px;
    margin: 0 0 2rem 0;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
  }

  .admin-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(62, 9, 148, 0.1);
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid var(--border-color);
  }

  .admin-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    border: 2px solid var(--accent-blue);
    box-shadow: 0 0 15px rgba(62, 9, 148, 0.5);
    flex-shrink: 0;
  }

  .admin-text {
    flex: 1;
  }

  .admin-greeting {
    font-size: 0.9rem;
    color: var(--text-gray);
    margin: 0 0 0.2rem 0;
  }

  .admin-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-light);
  }

  .sidebar-nav {
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: transparent;
    border: none;
    color: var(--text-gray);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s ease;
    text-align: left;
    position: relative;
  }

  .nav-item:hover {
    background: rgba(62, 9, 148, 0.15);
    color: var(--text-light);
  }

  .nav-item.active {
    background: rgba(62, 9, 148, 0.2);
    color: var(--text-light);
    border-left: 3px solid var(--accent-blue);
  }

  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent-blue);
    box-shadow: 0 0 10px var(--accent-blue);
  }

  .admin-main-content {
    margin-left: 280px;
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    position: relative;
    z-index: 1;
    max-width: calc(100vw - 280px);
    box-sizing: border-box;
    min-height: 100vh;
  }

  .admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid rgba(62, 9, 148, 0.2);
  }

  .admin-header-left h1 {
    font-size: 2.5rem;
    font-weight: 800;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    letter-spacing: -1px;
  }

  .admin-subtitle {
    color: var(--text-gray);
    font-size: 1.1rem;
    font-weight: 500;
  }

  .back-dashboard-btn {
    background: rgba(62, 9, 148, 0.1);
    border: 1px solid var(--border-color);
    color: var(--accent-blue);
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .back-dashboard-btn:hover {
    background: var(--primary-gradient);
    color: var(--text-light);
    transform: translateX(-5px);
    box-shadow: 0 4px 15px rgba(62, 9, 148, 0.3);
  }

  .admin-stats-section {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
    align-items: center;
  }

  .members-count h2 {
    font-size: 1.5rem;
    font-weight: 700;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .memberships-count {
    color: var(--text-gray);
    font-size: 0.95rem;
  }

  .search-wrapper {
    display: flex;
    gap: 1rem;
    max-width: 600px;
  }

  .search-container {
    flex: 1;
    position: relative;
  }

  .search-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem 1.5rem 1rem 3rem;
    color: #1A1A1D;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 10px rgba(62, 9, 148, 0.1);
  }

  .search-input::placeholder {
    color: #666;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent-blue);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 20px rgba(62, 9, 148, 0.3);
  }

  .search-icon {
    position: absolute;
    left: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--accent-blue);
    font-size: 1.1rem;
    pointer-events: none;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .add-button {
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(62, 9, 148, 0.3);
  }

  .add-button.primary {
    background: var(--primary-gradient);
    color: var(--text-light);
  }

  .add-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(62, 9, 148, 0.5);
  }

  .add-button.secondary {
    background: rgba(62, 9, 148, 0.1);
    color: var(--accent-blue);
    border: 2px solid var(--border-color);
  }

  .add-button.secondary:hover {
    background: var(--primary-gradient);
    color: var(--text-light);
  }

  .membership-section {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(62, 9, 148, 0.2);
    box-shadow: 0 10px 40px rgba(62, 9, 148, 0.1);
    backdrop-filter: blur(10px);
  }

  .membership-title {
    font-size: 1.8rem;
    font-weight: 700;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 1.5rem 0;
  }

  .membership-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .membership-card {
    background: rgba(255, 255, 255, 0.7);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(62, 9, 148, 0.2);
    text-align: center;
    transition: all 0.3s ease;
  }

  .membership-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(62, 9, 148, 0.2);
  }

  .membership-price {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--accent-blue);
    margin-bottom: 0.5rem;
  }

  .membership-name {
    font-size: 1rem;
    color: #666;
    font-weight: 500;
  }

  .membership-duration {
    font-size: 0.9rem;
    color: #888;
    margin-top: 0.25rem;
  }

  .membership-controls {
    display: flex;
    gap: 1rem;
    align-items: end;
    flex-wrap: wrap;
  }

  .control-input {
    flex: 1;
    min-width: 120px;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    color: #1A1A1D;
    font-size: 1rem;
  }

  .members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
    animation: fadeInUp 0.6s ease;
  }

  .member-card {
    background: var(--card-bg);
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid rgba(62, 9, 148, 0.2);
    box-shadow: 0 8px 32px rgba(62, 9, 148, 0.15);
    position: relative;
  }

  .member-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--primary-gradient);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 0;
  }

  .member-card:hover::before {
    opacity: 0.08;
  }

  .member-card:hover {
    transform: translateY(-12px) scale(1.02);
    border-color: var(--accent-blue);
    box-shadow: 0 20px 50px rgba(62, 9, 148, 0.3);
  }

  .card-header {
    position: relative;
    overflow: hidden;
  }

  .status-indicator {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    box-shadow: 0 0 12px currentColor;
    animation: pulse 2s infinite;
    z-index: 2;
  }

  .status-indicator.active {
    background: var(--success-green);
    box-shadow: 0 0 20px var(--success-green);
  }

  .card-gradient {
    background: var(--primary-gradient);
    padding: 2rem;
    position: relative;
    z-index: 1;
  }

  .card-gradient::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
    animation: shimmer 4s infinite;
  }

  .card-name {
    font-weight: 800;
    font-size: 1.8rem;
    letter-spacing: 1px;
    margin: 0 0 0.5rem 0;
    color: var(--text-light);
  }

  .card-phone {
    font-size: 1.2rem;
    margin: 0.5rem 0;
    opacity: 0.95;
    font-weight: 500;
    color: var(--text-light);
  }

  .card-phone.secondary {
    font-size: 0.95rem;
    opacity: 0.85;
  }

  .card-bill {
    font-size: 1rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.9;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .card-body {
    padding: 2rem;
    position: relative;
    z-index: 1;
    background: var(--card-bg);
  }

  .member-avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    background: var(--primary-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    border: 4px solid var(--accent-blue);
    box-shadow: 0 10px 30px rgba(62, 9, 148, 0.4);
    transition: all 0.4s ease;
  }

  .card-footer-info {
    text-align: center;
  }

  .footer-name {
    font-weight: 700;
    font-size: 1.4rem;
    margin: 0 0 0.5rem 0;
    letter-spacing: 0.5px;
    color: #1A1A1D;
  }

  .footer-phone {
    font-size: 1.1rem;
    color: #666;
    margin: 0.5rem 0;
    font-weight: 500;
  }

  .status-text {
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .status-text.active {
    color: var(--success-green);
  }

  .status-text.inactive {
    color: #ef4444;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-gray);
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .empty-state p {
    color: #666;
    margin-bottom: 1.5rem;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(26, 26, 29, 0.9);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    backdrop-filter: blur(10px);
  }

  .modal {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 24px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    padding: 2.5rem;
    border: 2px solid rgba(62, 9, 148, 0.2);
    box-shadow: 0 25px 60px rgba(62, 9, 148, 0.3);
    overflow-y: auto;
    position: relative;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid rgba(62, 9, 148, 0.2);
  }

  .modal-title {
    font-size: 2rem;
    font-weight: 700;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .close-button {
    background: rgba(62, 9, 148, 0.2);
    border: 2px solid var(--border-color);
    font-size: 1.5rem;
    color: var(--accent-blue);
    cursor: pointer;
    padding: 0.75rem;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .close-button:hover {
    background: var(--primary-gradient);
    color: var(--text-light);
    transform: rotate(90deg);
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .form-fields {
    flex: 1;
    overflow-y: auto;
  }

  .form-field {
    margin-bottom: 1.5rem;
  }

  .form-label {
    color: #1A1A1D;
    font-size: 1rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
    display: block;
    letter-spacing: 0.5px;
  }

  .required {
    color: #ef4444;
  }

  .form-input,
  .form-select {
    width: 100%;
    padding: 1.25rem 1.5rem;
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid rgba(62, 9, 148, 0.2);
    border-radius: 16px;
    color: #1A1A1D;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(62, 9, 148, 0.1);
  }

  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: var(--accent-blue);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 25px rgba(62, 9, 148, 0.3);
    transform: translateY(-2px);
  }

  .form-helper {
    display: block;
    margin-top: 0.4rem;
    font-size: 0.8rem;
    color: #888;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid rgba(62, 9, 148, 0.2);
  }

  .submit-button {
    flex: 1;
    padding: 1.25rem;
    border: none;
    border-radius: 16px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    letter-spacing: 1px;
    transition: all 0.3s ease;
  }

  .submit-button.primary {
    background: var(--primary-gradient);
    color: var(--text-light);
    box-shadow: 0 8px 25px rgba(62, 9, 148, 0.4);
  }

  .submit-button.primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(62, 9, 148, 0.6);
  }

  .submit-button.secondary {
    background: rgba(62, 9, 148, 0.1);
    color: var(--accent-blue);
    border: 2px solid var(--border-color);
  }

  .submit-button.secondary:hover {
    background: var(--primary-gradient);
    color: var(--text-light);
  }

  .modal-memberships-section {
    margin-bottom: 1.5rem;
  }

  .section-header {
    margin-bottom: 1rem;
  }

  .section-subtitle {
    font-size: 1rem;
    font-weight: 600;
    color: #1A1A1D;
  }

  .toast-container {
    position: fixed;
    right: 2rem;
    top: 2rem;
    z-index: 10000;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 2rem;
    border-radius: 16px;
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 0 15px 40px rgba(34, 197, 94, 0.4);
    backdrop-filter: blur(10px);
    animation: slideInRight 0.4s ease;
    pointer-events: all;
  }

  .toast.success {
    background: rgba(34, 197, 94, 0.9);
    color: #ffffff;
    border: 1px solid var(--success-green);
  }

  .toast-icon {
    font-size: 1.5rem;
  }

  .dashboard-placeholder {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
  }

  .dashboard-placeholder h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .mobile-menu-toggle {
    display: none;
    position: fixed;
    top: 1.5rem;
    left: 1.5rem;
    z-index: 101;
    background: var(--primary-gradient);
    border: none;
    color: white;
    width: 55px;
    height: 55px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(62, 9, 148, 0.4);
    backdrop-filter: blur(10px);
  }

  .tab-toggle {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
  }

  .tab-btn {
    padding: 1rem 2rem;
    border: 2px solid rgba(62, 9, 148, 0.2);
    border-radius: 12px;
    background: rgba(62, 9, 148, 0.1);
    color: var(--text-gray);
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
  }

  .tab-btn:hover {
    background: var(--primary-gradient);
    color: var(--text-light);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(62, 9, 148, 0.3);
  }

  .tab-btn.active {
    background: var(--primary-gradient);
    color: var(--text-light);
    box-shadow: 0 8px 25px rgba(62, 9, 148, 0.4);
  }

  .dashboard-content {
    animation: fadeInUp 0.6s ease;
  }

  .storage-nav {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(62, 9, 148, 0.2);
    box-shadow: 0 8px 32px rgba(62, 9, 148, 0.1);
  }

  .storage-nav .nav-item {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.95rem;
    color: var(--text-gray);
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .storage-nav .nav-item.active {
    background: var(--primary-gradient);
    color: var(--text-light);
    box-shadow: 0 4px 15px rgba(62, 9, 148, 0.4);
  }

  .storage-nav .nav-item:hover {
    background: rgba(62, 9, 148, 0.2);
    color: var(--text-light);
  }

  .reports-section {
    animation: fadeInUp 0.6s ease;
  }

  .table-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(62, 9, 148, 0.15);
    border: 1px solid rgba(62, 9, 148, 0.1);
    backdrop-filter: blur(20px);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: var(--card-bg);
  }

  th, td {
    padding: 1.5rem;
    text-align: left;
    border-bottom: 1px solid rgba(62, 9, 148, 0.1);
    font-family: 'Poppins', sans-serif;
  }

  th {
    background: rgba(62, 9, 148, 0.15);
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--accent-blue);
  }

  td {
    color: #1A1A1D;
    font-weight: 500;
  }

  .report-btn, .edit-btn, .delete-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
    margin-right: 0.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .report-btn {
    background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
    color: var(--text-light);
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
  }

  .report-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
  }

  .edit-btn {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    color: var(--text-light);
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  }

  .edit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
  }

  .delete-btn {
    background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
    color: var(--text-light);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  }

  .delete-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
  }

  .empty-reports {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-gray);
  }

  .empty-reports h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes shimmer {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-20px, -20px) rotate(180deg); }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @media (max-width: 1024px) {
    #root,
    .admin-container,
    .admin-main-content,
    .membership-section,
    .members-grid,
    .membership-grid {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .admin-sidebar {
      width: min(280px, 85vw);
      left: -110%;
      position: fixed;
      top: 0;
      height: 100vh;
      z-index: 200;
      transition: left 0.28s ease;
    }

    .admin-sidebar.open { left: 0; }

    .admin-main-content {
      margin-left: 0;
      max-width: 100vw;
      width: 100vw;
      padding: 1rem;
    }

    .admin-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .admin-stats-section {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .search-wrapper {
      width: 100%;
      max-width: 100%;
    }

    .action-buttons {
      flex-direction: column;
      align-items: stretch;
    }

    .membership-section,
    .membership-card,
    .member-card,
    .modal {
      width: 100%;
      max-width: 100%;
      margin: 0;
    }

    .membership-grid,
    .members-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .card-gradient, .card-body {
      padding: 1rem;
    }

    .admin-sidebar .sidebar-title,
    .admin-info,
    .nav-item,
    .membership-title,
    .card-name,
    .admin-header-left h1 {
      font-size: clamp(0.92rem, 3.2vw, 1.8rem);
    }
  }

  @media (max-width: 768px) {
    body,
    html,
    #root {
      width: 100% !important;
      min-width: 320px;
      overflow-x: hidden;
    }

    .admin-sidebar {
      width: 100vw;
      max-width: 100vw;
      left: -100%;
      border-right: none;
      border-left: 1px solid rgba(62, 9, 148, 0.2);
    }

    .admin-sidebar.open {
      left: 0;
    }

    .admin-sidebar .sidebar-header {
      padding: 1rem;
    }

    .admin-main-content {
      padding: 0.75rem;
      margin-left: 0;
      width: 100%;
      max-width: 100%;
    }

    .admin-header-left h1 {
      font-size: 1.6rem;
    }

    .membership-card,
    .member-card,
    .modal {
      padding: 1rem;
      border-radius: 12px;
    }

    .search-input,
    .control-input,
    .back-dashboard-btn,
    .add-button {
      font-size: 0.95rem;
      padding: 0.8rem 1rem;
    }

    .admin-sidebar {
      left: -280px;
    }

    .admin-main-content {
      margin-left: 0;
      padding: 1.5rem 1rem;
    }

    .mobile-menu-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .members-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .admin-stats-section {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .action-buttons {
      flex-direction: column;
    }

    .admin-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .storage-nav {
      gap: 1rem;
      flex-wrap: wrap;
    }

    .storage-nav .nav-item {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }

    th, td {
      padding: 1rem 0.75rem;
      font-size: 0.9rem;
    }

    .report-btn, .edit-btn, .delete-btn {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }

    .admin-main-content .members-table th {
      color: white !important;
    }

    .admin-main-content .members-table td {
      color: #1e293b !important;
    }
  }

  @media (max-width: 480px) {
    .membership-controls {
      flex-direction: column;
    }

    .control-input {
      min-width: auto;
    }

    .table-container {
      border-radius: 12px;
    }

    table {
      font-size: 0.85rem;
    }
  }
`;

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('sidebarOpen');
      return stored === null ? true : JSON.parse(stored);
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
    } catch (e) {}
  }, [sidebarOpen]);

  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    fetchMembers();
    fetchMemberships();
  }, []);

  const fetchMembers = async () => {
    const res = await fetch(USERS_API);
    const data = await res.json();
    const onlyMembers = data.filter(user => user.role === "member");
    setMembers(onlyMembers);
  };

  const fetchMemberships = async () => {
    const res = await fetch(MEMBERSHIP_API);
    const data = await res.json();
    setMemberships(data);
  };

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddMembershipModal, setShowAddMembershipModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message, ms = 3500) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), ms);
  };

  const [newMember, setNewMember] = useState({
    name: "", mobile: "", email: "", dob: "", address: "", zone: "", membership: ""
  });

  const [newMembership, setNewMembership] = useState({
    months: "",
    price: ""
  });

  useEffect(() => {
    if (showAddMemberModal || showAddMembershipModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showAddMemberModal, showAddMembershipModal]);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm)
  );

  const handleAddMember = async (e) => {
    e.preventDefault();

    const newMemberData = {
      name: newMember.name,
      email: newMember.email,
      phone: newMember.mobile,
      password: "Member@123",
      role: "member",
      membership: newMember.membership,
      status: "active",
      otp: null,
      otpExpiry: null
    };

    await fetch(USERS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMemberData)
    });

    fetchMembers();

    setNewMember({
      name: "", mobile: "", email: "", dob: "", address: "", zone: "", membership: ""
    });

    setShowAddMemberModal(false);
    showToast(`✅ New member "${newMemberData.name}" added!`);
  };

  const handleAddMembership = async (e) => {
    e.preventDefault();

    const newPlan = {
      name: `${newMembership.months} Month${parseInt(newMembership.months) > 1 ? 's' : ''} Membership`,
      price: `₹${newMembership.price}`,
      duration: parseInt(newMembership.months)
    };

    await fetch(MEMBERSHIP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPlan)
    });

    fetchMemberships();

    setNewMembership({ months: "", price: "" });
    setShowAddMembershipModal(false);
    showToast(`✅ Plan added successfully!`);
  };

  const [activePage, setActivePage] = useState('members');

  return (
    <>
      <style>{adminStyles}</style>
      <div className="admin-container">
        <div className="admin-overlay"></div>

        <nav className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h1 className="sidebar-title">GYM ADMIN</h1>
            <div className="admin-info">
              <div className="admin-avatar">👨‍💼</div>
              <div className="admin-text">
                <p className="admin-greeting">Welcome Back</p>
                <p className="admin-name">Super Admin</p>
              </div>
            </div>
          </div>

          <div className="sidebar-nav">
            <button
              className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActivePage('dashboard')}
            >
              <span>📊</span> Dashboard
            </button>
            <button
              className={`nav-item ${activePage === 'members' ? 'active' : ''}`}
              onClick={() => setActivePage('members')}
            >
              <span>👥</span> Members
            </button>
            <button
              className={`nav-item ${activePage === 'member-reports' ? 'active' : ''}`}
              onClick={() => setActivePage('member-reports')}
            >
              <span>📈</span> Member Monthly Reports
            </button>
          </div>
        </nav>

        {!sidebarOpen && (
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}

        <main className="admin-main-content">
          <header className="admin-header">
            <div className="admin-header-left">
              <h1 className="admin-title">
                {activePage === 'members' ? 'Member Management' :
                 activePage === 'member-reports' ? 'Member Monthly Reports' :
                 'Dashboard'}
              </h1>
              <p className="admin-subtitle">
                {activePage === 'members' ? 'Manage your gym members efficiently' :
                 activePage === 'member-reports' ? 'View detailed monthly reports' :
                 'Quick overview of gym statistics'}
              </p>
            </div>
            <div className="admin-header-right">
              <button className="back-dashboard-btn">
                <span>←</span> Quick Stats
              </button>
            </div>
          </header>

          {activePage === 'members' && (
            <>
              <div className="admin-stats-section">
                <div className="members-count">
                  <h2>Total Members: {filteredMembers.length}</h2>
                  <span className="memberships-count">{memberships.length} Plans Available</span>
                </div>
                <div className="search-wrapper">
                  <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search by name or mobile..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="add-button primary"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  ➕ Add New Member
                </button>
                <button
                  className="add-button primary"
                  onClick={() => setShowAddMembershipModal(true)}
                >
                  📋 Add Membership Plan
                </button>
              </div>

              <section className="members-grid">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <article key={member.id} className="member-card">
                      <div className="card-header">
                        <div className={`status-indicator ${member.status}`}></div>
                        <div className="card-gradient">
                          <h3 className="card-name">{member.name}</h3>
                          <p className="card-phone">{member.phone}</p>
                          {member.email && <p className="card-phone secondary">{member.email}</p>}
                          {member.membership && (
                            <p className="card-bill">{member.membership}</p>
                          )}
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="member-avatar">👤</div>
                        <div className="card-footer-info">
                          <h4 className="footer-name">{member.name}</h4>
                          <p className="footer-phone">{member.phone}</p>
                          {member.status === 'active' ? (
                            <p className="status-text active">Active Member</p>
                          ) : (
                            <p className="status-text inactive">Inactive Member</p>
                          )}
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No Members Found</h3>
                    <p>{searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first member'}</p>
                    <button className="add-button primary" onClick={() => setShowAddMemberModal(true)}>
                      ➕ Add First Member
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          {activePage === 'member-reports' && (
            <div className="dashboard-placeholder">
              <h2>📈 Member Monthly Reports</h2>
              <p>Reports content goes here — replace with your MemberReports component.</p>
            </div>
          )}

          {activePage === 'dashboard' && (
            <div className="dashboard-placeholder">
              <h2>📊 Dashboard Content</h2>
              <p>Dashboard features coming soon...</p>
            </div>
          )}
        </main>

        {showAddMemberModal && (
          <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Add New Member</h3>
                <button
                  className="close-button"
                  onClick={() => setShowAddMemberModal(false)}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddMember} className="modal-form">
                <div className="form-fields">
                  <div className="form-field">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="Enter full name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Mobile Number <span className="required">*</span></label>
                    <input
                      className="form-input"
                      placeholder="+91 9876543210"
                      value={newMember.mobile}
                      onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Email (Optional)</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="member@example.com"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Date of Birth</label>
                    <input
                      className="form-input"
                      type="date"
                      value={newMember.dob}
                      onChange={(e) => setNewMember({ ...newMember, dob: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Membership Plan <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={newMember.membership}
                      onChange={(e) => setNewMember({ ...newMember, membership: e.target.value })}
                      required
                    >
                      <option value="">Select Membership Plan</option>
                      {memberships.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} - {m.price}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="submit-button primary">
                    ✅ Add Member
                  </button>
                  <button
                    type="button"
                    className="submit-button secondary"
                    onClick={() => setShowAddMemberModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddMembershipModal && (
          <div className="modal-overlay" onClick={() => setShowAddMembershipModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Membership Plans ({memberships.length})</h3>
                <button
                  className="close-button"
                  onClick={() => setShowAddMembershipModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-memberships-section">
                <div className="section-header">
                  <h4 className="section-subtitle">Current Plans</h4>
                </div>
                <div className="membership-grid">
                  {memberships.map((m) => (
                    <div key={m.id} className="membership-card">
                      <div className="membership-price">{m.price}</div>
                      <div className="membership-name">{m.name}</div>
                      <div className="membership-duration">
                        {m.duration} Month{m.duration > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddMembership} className="modal-form">
                <div className="form-fields">
                  <div className="form-field">
                    <label className="form-label">Duration (Months) <span className="required">*</span></label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      max="12"
                      placeholder="1-12"
                      value={newMembership.months}
                      onChange={(e) => setNewMembership({ ...newMembership, months: e.target.value })}
                      required
                    />
                    <small className="form-helper">Enter duration between 1-12 months</small>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Price (₹) <span className="required">*</span></label>
                    <input
                      className="form-input"
                      type="number"
                      min="500"
                      placeholder="1000"
                      value={newMembership.price}
                      onChange={(e) => setNewMembership({ ...newMembership, price: e.target.value })}
                      required
                    />
                    <small className="form-helper">Enter price without ₹ symbol</small>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="submit"
                    className="submit-button primary"
                    disabled={!newMembership.months || !newMembership.price}
                  >
                    ✅ Add New Plan
                  </button>
                  <button
                    type="button"
                    className="submit-button secondary"
                    onClick={() => setShowAddMembershipModal(false)}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {toast.visible && (
          <div className="toast-container">
            <div className="toast success">
              <span className="toast-icon">✅</span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
