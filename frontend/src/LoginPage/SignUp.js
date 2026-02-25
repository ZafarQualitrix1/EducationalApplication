// src/components/StudentSignUp.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for redirect after signup
import "./SignUp.css";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [prnData, setPrnData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    let tempErrors = {};

    if (!formData.fullName) tempErrors.fullName = "Full Name is required";
    if (!formData.email) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      tempErrors.email = "Email is invalid";

    if (!formData.mobile) tempErrors.mobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.mobile))
      tempErrors.mobile = "Mobile number is invalid";

    if (!formData.dob) tempErrors.dob = "Date of Birth is required";
    if (!formData.gender) tempErrors.gender = "Gender is required";
    if (!formData.address) tempErrors.address = "Address is required";
    if (!formData.city) tempErrors.city = "City is required";
    if (!formData.state) tempErrors.state = "State is required";

    if (!formData.pinCode) tempErrors.pinCode = "PIN Code is required";
    else if (!/^\d{6}$/.test(formData.pinCode))
      tempErrors.pinCode = "PIN Code is invalid";

    if (!formData.password) tempErrors.password = "Password is required";
    else if (formData.password.length < 6)
      tempErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      tempErrors.confirmPassword = "Confirm Password is required";
    else if (formData.password !== formData.confirmPassword)
      tempErrors.confirmPassword = "Passwords do not match";

    if (!formData.role) tempErrors.role = "Role is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        // Prepare payload for backend
        const payload = {
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
          password: formData.password,
          profileImage: profileImage || null,
          role: formData.role,
        };

        const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.error) {
          setGeneralError(`❌ ${data.error}`);
          setSuccessMessage("");
        } else {
          setSuccessMessage("✅ Registration Successful!");
          setGeneralError("");
          
          // Store PRN data and show popup
          setPrnData({
            prn: data.prn || data.id,
            id: data.id || data.prn,
            fullName: data.fullName,
            email: data.email
          });
          setShowPopup(true);

          // Form reset
          setFormData({
            fullName: "",
            email: "",
            mobile: "",
            dob: "",
            gender: "",
            address: "",
            city: "",
            state: "",
            pinCode: "",
            password: "",
            confirmPassword: "",
            role: "student",
          });
        }
      } catch (err) {
        setGeneralError("❌ Server error. Please try again later.");
        setSuccessMessage("");
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    // Redirect to dashboard after popup is closed
    navigate(`/dashboard/${prnData.id}`);
  };

  return (
    <div className="signup-container">
      {/* Success Popup Modal */}
      {showPopup && prnData && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>✅ Registration Successful!</h2>
            </div>
            <div className="popup-body">
              <p className="popup-message">Congratulations! Your registration has been completed successfully.</p>
              <div className="prn-section">
                <label>Your PRN (Registration Number):</label>
                <div className="prn-box">{prnData.prn}</div>
              </div>
              <div className="popup-details">
                <p><strong>Name:</strong> {prnData.fullName}</p>
                <p><strong>Email:</strong> {prnData.email}</p>
              </div>
            </div>
            <div className="popup-footer">
              <button className="popup-btn" onClick={handleClosePopup}>Go to Home</button>
            </div>
          </div>
        </div>
      )}

      <form className="signup-form" onSubmit={handleSubmit}>
        <h2 className="signup-3d-title">Student Registration</h2>

        {generalError && <p className="error-text">{generalError}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}

        {/* Profile Image Upload */}
        <div className="form-group">
          <label>Profile Picture (Optional)</label>
          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-input"
            />
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
              </div>
            )}
          </div>
        </div>

        {[
          { label: "Full Name", name: "fullName", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Mobile", name: "mobile", type: "text" },
          { label: "Date of Birth", name: "dob", type: "date" },
          { label: "Address", name: "address", type: "text" },
          { label: "City", name: "city", type: "text" },
          { label: "State", name: "state", type: "text" },
          { label: "PIN Code", name: "pinCode", type: "text" },
          { label: "Password", name: "password", type: "password" },
          { label: "Confirm Password", name: "confirmPassword", type: "password" },
        ].map((field) => (
          <div className="form-group" key={field.name}>
            <label>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className={errors[field.name] ? "error-input" : ""}
            />
            {errors[field.name] && (
              <span className="error-text">{errors[field.name]}</span>
            )}
          </div>
        ))}

        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={errors.gender ? "error-input" : ""}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <span className="error-text">{errors.gender}</span>}
        </div>

        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={errors.role ? "error-input" : ""}
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <span className="error-text">{errors.role}</span>}
        </div>

        <button type="submit" className="signup-btn">Register</button>
      </form>
    </div>
  );
}

export default SignUp;
