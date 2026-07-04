import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  GraduationCap, 
  X, 
  LogOut 
} from 'lucide-react';
import { Avatar } from '../common';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose, navItems, user, onLogout }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-box">
              <img src="https://res.cloudinary.com/dwxqqx0oe/image/upload/v1772097342/VVITU-logo_ejvk7p.jpg" className='website-logo' alt="VVITU-logo" />
            </div>
            <span className="college-name">VVIT University</span>
          </div>
          <button className="close-sidebar-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <Avatar src={user.img} alt={user.name} size="md" />
            <div className="user-info">
              <p className="user-name">{user.name}</p>
              <p className="user-role">{user.role}</p>
            </div>
            <button onClick={onLogout} className="icon-btn icon-btn-sm">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
