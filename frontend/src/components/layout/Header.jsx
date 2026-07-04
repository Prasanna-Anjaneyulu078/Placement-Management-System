import React, { useRef, useState, useEffect } from 'react';
import { Bell, Menu, CheckCircle, Clock, Info } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ role, onToggleSidebar, user, onLogout }) {
  const navigate = useNavigate();
  const { notifications, markNotificationAsRead, clearNotifications } = useData();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef]);

  const getNotifIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      case 'status': return <Clock size={16} className="text-blue-500" />;
      case 'info': return <Info size={16} className="text-gray-500" />;
      default: return <Bell size={16} />;
    }
  };

  const title = role === 'student' ? 'Student Portal' : role === 'alumni' ? 'Alumni Portal' : 'Admin Dashboard';

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="menu-btn" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="flex flex-col">
          <h1 className="header-title" style={{ marginBottom: role === 'admin' ? '-2px' : '0' }}>
            {role === 'admin' ? (user?.name || 'Administrator') : title}
          </h1>
          {role === 'admin' && (
            <span className="text-xs md:text-sm font-medium text-gray-500">
              {user?.designation || 'Administrator'}
            </span>
          )}
        </div>
      </div>
      <div className="header-actions">
        <div className="dashboard-notification-wrapper" ref={notifRef}>
          <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {isNotifOpen && (
            <div className="notification-dropdown">
              <div className="notif-header">
                <h3>Notifications</h3>
                <button className="clear-btn" onClick={clearNotifications}>Clear All</button>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                      onClick={() => markNotificationAsRead(notif.id)}
                    >
                      <div className={`notif-icon-box ${notif.type || 'default'}`}>
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="notif-content">
                        <div className="notif-title-wrapper">
                          <p className="notif-title">{notif.title}</p>
                        </div>
                        <p className="notif-message">{notif.message}</p>
                        <span className="notif-date">{notif.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
