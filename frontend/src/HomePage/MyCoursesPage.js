import React from "react";
import "./MyCoursesPage.css";
import BackButton from '../components/BackButton';

const MyCoursesPage = () => {
  const courses = [
    { title: "React for Beginners", progress: 80 },
    { title: "Advanced JavaScript", progress: 100 },
    { title: "AI & Machine Learning Basics", progress: 40 },
  ];

  return (
    <div className="mycourses-page">
      <div className="page-back">
        <BackButton label="Back" />
      </div>
      <div className="mycourses-card">
        <h2>📚 My Courses</h2>
        <ul>
          {courses.map((course, idx) => (
            <li key={idx}>
              <span>{course.title}</span>
              <span>{course.progress === 100 ? "Completed" : `${course.progress}%`}</span>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${course.progress}%` }}></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyCoursesPage;
