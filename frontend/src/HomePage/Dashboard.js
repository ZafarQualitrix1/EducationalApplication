import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Dashboard.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BackButton from '../components/BackButton';

function Dashboard() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [editImage, setEditImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studyData] = useState([
    { day: 'Mon', minutes: 120 },
    { day: 'Tue', minutes: 150 },
    { day: 'Wed', minutes: 100 },
    { day: 'Thu', minutes: 180 },
    { day: 'Fri', minutes: 200 },
    { day: 'Sat', minutes: 90 },
    { day: 'Sun', minutes: 130 }
  ]);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    const loadData = async () => {
      await fetchDashboardData();
    };
    loadData();
  }, [userId, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user data - with fallback to dummy data
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/dashboard/${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          } else {
            setDefaultUser();
          }
        } else {
          setDefaultUser();
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setDefaultUser();
      }

      // Fetch ranking data - with fallback to dummy data
      try {
        const rankResponse = await fetch(`${process.env.REACT_APP_API_URL}/ranking`);
        if (rankResponse.ok) {
          const rankData = await rankResponse.json();
          if (rankData.ranking && rankData.ranking.length > 0) {
            setRanking(rankData.ranking);
          } else {
            setDefaultRanking();
          }
        } else {
          setDefaultRanking();
        }
      } catch (err) {
        console.error('Error fetching ranking:', err);
        setDefaultRanking();
      }

      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const setDefaultUser = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser({
      id: userId,
      prn: userId,
      fullName: storedUser.fullName || 'Student User',
      email: storedUser.email || 'student@example.com',
      profileImage: storedUser.profileImage || null,
      dailyStudyMinutes: 450,
      ranking: 3,
      mobile: storedUser.mobile || '9876543210',
      city: storedUser.city || 'Mumbai'
    });
  };

  const setDefaultRanking = () => {
    setRanking([
      { 
        id: 1, prn: 1, fullName: 'Raj Kumar', dailyStudyMinutes: 520,
        avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%234a90e2%22/%3E%3Ctext x=%2250%22 y=%2270%22 font-size=%2240%22 font-weight=%22bold%22 fill=%22white%22 text-anchor=%22middle%22%3ERK%3C/text%3E%3C/svg%3E'
      },
      { 
        id: 2, prn: 2, fullName: 'Priya Singh', dailyStudyMinutes: 480,
        avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23f093fb%22/%3E%3Ctext x=%2250%22 y=%2270%22 font-size=%2240%22 font-weight=%22bold%22 fill=%22white%22 text-anchor=%22middle%22%3EPS%3C/text%3E%3C/svg%3E'
      },
      { 
        id: 3, prn: 3, fullName: 'Amit Patel', dailyStudyMinutes: 450,
        avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%224ade80%22/%3E%3Ctext x=%2250%22 y=%2270%22 font-size=%2240%22 font-weight=%22bold%22 fill=%22white%22 text-anchor=%22middle%22%3EAP%3C/text%3E%3C/svg%3E'
      },
      { 
        id: 4, prn: 4, fullName: 'Neha Gupta', dailyStudyMinutes: 420,
        avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23fbbf24%22/%3E%3Ctext x=%2250%22 y=%2270%22 font-size=%2240%22 font-weight=%22bold%22 fill=%22white%22 text-anchor=%22middle%22%3ENG%3C/text%3E%3C/svg%3E'
      },
      { 
        id: 5, prn: 5, fullName: 'Vikram Shah', dailyStudyMinutes: 390,
        avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%2306b6d4%22/%3E%3Ctext x=%2250%22 y=%2270%22 font-size=%2240%22 font-weight=%22bold%22 fill=%22white%22 text-anchor=%22middle%22%3EVS%3C/text%3E%3C/svg%3E'
      }
    ]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!imagePreview) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/update-profile-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          profileImage: imagePreview
        })
      });
      const data = await response.json();
      if (data.message) {
        setUser({...user, profileImage: imagePreview});
        setEditImage(false);
        setImagePreview(null);
        alert('✅ Profile image updated successfully');
      }
    } catch (err) {
      alert('❌ Error updating profile image');
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading Dashboard...</div>;
  }

  if (!user) {
    return <div className="dashboard-loading">Error loading user data</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="page-back">
        <BackButton label="Back" />
      </div>
      {/* Left Sidebar */}
      <div className="dashboard-left">
        {/* User Profile Card */}
        <div className="profile-card">
          <div className="profile-image-container">
            {editImage ? (
              <div className="image-edit-section">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                />
                {imagePreview && (
                  <>
                    <img src={imagePreview} alt="Preview" className="profile-preview" />
                    <button onClick={handleSaveImage} className="save-btn">Save</button>
                    <button onClick={() => {
                      setEditImage(false);
                      setImagePreview(null);
                    }} className="cancel-btn">Cancel</button>
                  </>
                )}
              </div>
            ) : (
              <>
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="profile-img" />
                ) : (
                  <div className="profile-placeholder">
                    <span className="placeholder-text">{user.fullName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <button onClick={() => setEditImage(true)} className="edit-image-btn">Edit</button>
              </>
            )}
          </div>
          
          <div className="profile-info">
            <h2>{user.fullName}</h2>
            <p className="prn-text">PRN: {user.prn}</p>
            <p className="email-text">{user.email}</p>
            <p className="city-text">📍 {user.city}</p>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-label">Daily Study</span>
              <span className="stat-value">{user.dailyStudyMinutes} min</span>
            </div>
            <div className="stat">
              <span className="stat-label">Rank</span>
              <span className="stat-value">#{user.ranking || '-'}</span>
            </div>
          </div>
        </div>

        {/* Top Rankers */}
        <div className="ranking-card">
          <h3>🏆 Top Rankers</h3>
          <div className="ranking-list">
            {ranking && ranking.slice(0, 5).map((student, index) => (
              <div key={index} className="ranking-item">
                <span className="rank-badge">
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.fullName} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="rank-info">
                  <p className="rank-name">{student.fullName || 'Student'}</p>
                  <p className="rank-minutes">⏱️ {student.dailyStudyMinutes || 0} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="dashboard-right">
        {/* Study Chart */}
        <div className="chart-container">
          <h3>📊 Weekly Study Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00aaff" />
              <XAxis dataKey="day" stroke="#00aaff" />
              <YAxis stroke="#00aaff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '2px solid #00aaff',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#00ff00"
                strokeWidth={3}
                dot={{ fill: '#00aaff', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Video Section */}
        <div className="video-section">
          <h3>🎥 Daily Study Video</h3>
          <div className="video-container">
            <iframe
              width="100%"
              height="280"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Study Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
