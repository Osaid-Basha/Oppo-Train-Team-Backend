class Member {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.studentNumber = data.studentNumber;
    this.email = data.email;
    this.password = data.password;
    this.gender = data.gender || 'Male';
    this.yearInSchool = data.yearInSchool || 'First';
    this.phone = data.phone || '';
    this.dateOfBirth = data.dateOfBirth || '';
    this.address = data.address || '';
    this.status = data.status || 'pending'; // pending, active, inactive
    this.avatar = data.avatar || ''; // Profile picture URL or initials
    this.initials = data.initials || ''; // Generated initials
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.approvedAt = data.approvedAt || null;
    this.approvedBy = data.approvedBy || null;
  }

  // Generate initials from first and last name
  generateInitials() {
    const first = this.firstName ? this.firstName.charAt(0).toUpperCase() : '';
    const last = this.lastName ? this.lastName.charAt(0).toUpperCase() : '';
    return first + last;
  }

  // Get full name
  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Validate member data
  static validate(data) {
    const errors = [];

    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!data.lastName || data.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }

    if (!data.studentNumber || data.studentNumber.trim().length === 0) {
      errors.push('Student number is required');
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email is required');
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (data.yearInSchool && !['First', 'Second', 'Third', 'Fourth', 'Fifth'].includes(data.yearInSchool)) {
      errors.push('Invalid year in school');
    }

    if (data.gender && !['Male', 'Female', 'Other'].includes(data.gender)) {
      errors.push('Invalid gender selection');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate member update data (without password requirement)
  static validateUpdate(data) {
    const errors = [];

    if (data.firstName && data.firstName.trim().length === 0) {
      errors.push('First name cannot be empty');
    }

    if (data.lastName && data.lastName.trim().length === 0) {
      errors.push('Last name cannot be empty');
    }

    if (data.email && data.email.trim().length > 0) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    if (data.yearInSchool && !['First', 'Second', 'Third', 'Fourth', 'Fifth'].includes(data.yearInSchool)) {
      errors.push('Invalid year in school');
    }

    if (data.gender && !['Male', 'Female', 'Other'].includes(data.gender)) {
      errors.push('Invalid gender selection');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert to Firestore document
  toFirestore() {
    return {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      studentNumber: this.studentNumber.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password, // Note: In production, this should be hashed
      gender: this.gender,
      yearInSchool: this.yearInSchool,
      phone: this.phone.trim(),
      dateOfBirth: this.dateOfBirth,
      address: this.address.trim(),
      status: this.status,
      avatar: this.avatar,
      initials: this.initials || this.generateInitials(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      approvedAt: this.approvedAt,
      approvedBy: this.approvedBy
    };
  }

  // Create from Firestore document
  static fromFirestore(doc) {
    const data = doc.data();
    return new Member({
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate() || null
    });
  }

  // Check if member is pending
  isPending() {
    return this.status === 'pending';
  }

  // Check if member is active
  isActive() {
    return this.status === 'active';
  }

  // Check if member is inactive
  isInactive() {
    return this.status === 'inactive';
  }

  // Approve member
  approve(approvedBy) {
    this.status = 'active';
    this.approvedAt = new Date();
    this.approvedBy = approvedBy;
    this.updatedAt = new Date();
  }

  // Reject member
  reject(rejectedBy) {
    this.status = 'inactive';
    this.updatedAt = new Date();
  }

  // Deactivate member
  deactivate() {
    this.status = 'inactive';
    this.updatedAt = new Date();
  }

  // Activate member
  activate() {
    this.status = 'active';
    this.updatedAt = new Date();
  }
}

module.exports = Member;
