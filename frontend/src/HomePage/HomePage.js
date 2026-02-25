import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import BackButton from '../components/BackButton';
import { FaBook, FaUsers, FaAward, FaPlay, FaGraduationCap, FaStar, FaArrowRight, FaBars, FaTimes, FaRocket, FaCode, FaChartLine } from 'react-icons/fa';

function HomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const courses = [
    { id: 1, title: 'Java for QA Automation', students: 156, rating: 4.8, icon: '☕', category: 'QA Automation' },
    { id: 2, title: 'Python for QA Automation', students: 142, rating: 4.9, icon: '🐍', category: 'QA Automation' },
    { id: 3, title: 'Selenium WebDriver with Java', students: 128, rating: 4.7, icon: '🔍', category: 'QA Automation' },
    { id: 4, title: 'API Automation with RestAssured', students: 95, rating: 4.9, icon: '🌐', category: 'QA Automation' },
    { id: 5, title: 'Mobile Automation with Appium', students: 67, rating: 4.8, icon: '📱', category: 'QA Automation' },
    { id: 6, title: 'Selenium with Python', students: 103, rating: 4.7, icon: '🐍', category: 'QA Automation' },
    { id: 7, title: 'Web Development', students: 1250, rating: 4.8, icon: '🌐', category: 'Development' },
    { id: 8, title: 'Data Science', students: 980, rating: 4.9, icon: '📊', category: 'Data' },
    { id: 9, title: 'Mobile Development', students: 850, rating: 4.7, icon: '📱', category: 'Development' },
    { id: 10, title: 'AI & Machine Learning', students: 750, rating: 4.9, icon: '🤖', category: 'Data' },
    { id: 11, title: 'Cloud Computing', students: 620, rating: 4.8, icon: '☁️', category: 'Infrastructure' },
    { id: 12, title: 'Cybersecurity', students: 540, rating: 4.9, icon: '🔐', category: 'Security' }
  ];

  const features = [
    { title: 'Live Classes', desc: 'Interactive live sessions', icon: '🎥', color: '#FF6B6B' },
    { title: 'Expert Mentors', desc: 'Learn from industry experts', icon: '👨‍🏫', color: '#4ECDC4' },
    { title: '24/7 Support', desc: 'Always here to help', icon: '💬', color: '#45B7D1' },
    { title: 'Certificate', desc: 'Verified certificates', icon: '🏆', color: '#FFA502' }
  ];

  const stats = [
    { number: '50K+', label: 'Active Students' },
    { number: '500+', label: 'Expert Courses' },
    { number: '98%', label: 'Success Rate' },
    { number: '200+', label: 'Certificates' }
  ];

  const testimonials = [
    { name: 'Raj Kumar', course: 'Web Development', rating: 5, text: 'Life-changing course! Great content and mentors.' },
    { name: 'Priya Singh', course: 'Data Science', rating: 5, text: 'Excellent learning experience. Highly recommended!' },
    { name: 'Amit Patel', course: 'AI & ML', rating: 5, text: 'Best investment for my career. Superb teaching!' }
  ];

  const videos = [
    { title: 'Java Basics for QA Automation', duration: '42:15', icon: '☕', views: '5.4K', category: 'Tutorial' },
    { title: 'Setting up Selenium Environment', duration: '28:30', icon: '🔍', views: '4.2K', category: 'Setup' },
    { title: 'Python Essential Concepts', duration: '55:12', icon: '🐍', views: '6.1K', category: 'Tutorial' },
    { title: 'RestAssured API Testing', duration: '38:45', icon: '🌐', views: '3.8K', category: 'Tutorial' },
    { title: 'Appium Installation Guide', duration: '22:18', icon: '📱', views: '2.4K', category: 'Setup' },
    { title: 'Web Development Fundamentals', duration: '45:30', icon: '🌐', views: '8.9K', category: 'Tutorial' },
    { title: 'Data Science with Python', duration: '52:15', icon: '📊', views: '7.6K', category: 'Tutorial' },
    { title: 'Machine Learning Algorithms', duration: '68:45', icon: '🤖', views: '5.3K', category: 'Tutorial' }
  ];

  return (
    <div className="homepage">
      <div className="page-back">
        <BackButton label="Back" />
      </div>
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <FaGraduationCap /> CODE WARRIOR
          </div>
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#home">Home</a>
            <a href="#courses">Courses</a>
            <a href="#videos">Videos</a>
            <a href="#about">About</a>
            <a onClick={() => navigate('/admin-login')} style={{ cursor: 'pointer' }}>Admin Portal</a>
            <a onClick={() => navigate('/mentor-login')} style={{ cursor: 'pointer' }}>Mentor Portal</a>
            <div className="nav-buttons">
              {user ? (
                <>
                  <button className="btn-signin" onClick={() => navigate(`/dashboard/${user.id}`)}>
                    Dashboard
                  </button>
                  <button className="btn-signup" onClick={() => navigate('/logout')}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-signin" onClick={() => navigate('/admin-login')}>
                    Admin
                  </button>
                  <button className="btn-secondary" onClick={() => navigate('/mentor-login')}>
                    Mentor
                  </button>
                  <button className="btn-signup" onClick={() => navigate('/login')}>
                    Student Login
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Learn Skills That <span className="highlight">Matter</span>
            </h1>
            <p className="hero-subtitle">
              Master in-demand skills with industry experts. Start your journey to success today!
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/signup')}>
                Get Started Free <FaArrowRight />
              </button>
              <button className="btn-secondary" onClick={() => document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' })}>
                Watch Demo <FaPlay />
              </button>
            </div>
            <p className="hero-info">👥 Join 50K+ students learning today</p>
          </div>
          <div className="hero-image">
            <div className="floating-card card1">📚 Learning</div>
            <div className="floating-card card2">💻 Coding</div>
            <div className="floating-card card3">🎯 Success</div>
            <div className="hero-illustration">
              <div className="circle circle1" />
              <div className="circle circle2" />
              <div className="circle circle3" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Code Warrior?</h2>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card" style={{ borderTopColor: feature.color }}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-item">
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Courses */}
      <section className="courses" id="courses">
        <h2>Popular Courses</h2>
        <p className="section-subtitle">Choose from 500+ courses and start learning</p>
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-icon">{course.icon}</div>
              <h3>{course.title}</h3>
              <p className="course-category">{course.category}</p>
              <div className="course-info">
                <span className="students">👥 {course.students.toLocaleString()}</span>
                <span className="rating">⭐ {course.rating}</span>
              </div>
              <button className="btn-enroll" onClick={() => navigate('/signup')}>
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Video Section */}
      <section className="videos" id="videos">
        <h2>Educational Videos</h2>
        <p className="section-subtitle">Learn from our best video tutorials</p>
        <div className="videos-grid">
          {videos.map((video, idx) => (
            <div key={idx} className="video-card">
              <div className="video-thumbnail">
                <span className="video-icon">{video.icon}</span>
                <button className="play-btn">
                  <FaPlay />
                </button>
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                <div className="video-meta">
                  <span>⏱️ {video.duration}</span>
                  <span>👁️ {video.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials" id="about">
        <h2>What Our Students Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar">{testimonial.name.charAt(0)}</div>
                <div className="testimonial-meta">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.course}</p>
                </div>
              </div>
              <div className="stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="star" />
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Features */}
      <section className="latest-features">
        <h2>🚀 Latest Trending Features</h2>
        <div className="features-showcase">
          <div className="feature-item">
            <FaRocket className="feature-emoji" />
            <h3>AI-Powered Learning</h3>
            <p>Personalized learning paths based on your pace and style</p>
          </div>
          <div className="feature-item">
            <FaCode className="feature-emoji" />
            <h3>Live Coding Sessions</h3>
            <p>Interactive coding with real-time feedback from experts</p>
          </div>
          <div className="feature-item">
            <FaChartLine className="feature-emoji" />
            <h3>Progress Tracking</h3>
            <p>Advanced analytics to track your learning journey</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to Transform Your Career?</h2>
          <p>Start learning with industry experts and get certified</p>
          <button className="btn-primary large" onClick={() => navigate('/signup')}>
            Start Learning Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Code Warrior</h4>
            <p>Empowering students worldwide with quality education</p>
          </div>
          <div className="footer-section">
            <h5>Quick Links</h5>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#courses">Courses</a></li>
              <li><a href="#videos">Videos</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h5>Contact</h5>
            <p>📧 info@codewarrior.com</p>
            <p>📞 +1 (555) 123-4567</p>
          </div>
          <div className="footer-section">
            <h5>Follow Us</h5>
            <div className="social-links">
              <a href="#facebook">f</a>
              <a href="#twitter">𝕏</a>
              <a href="#linkedin">in</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Code Warrior. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
