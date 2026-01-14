export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

class AuthService {
  private users: User[] = [];
  private currentUser: User | null = null;

  async register(userData: Omit<User, 'id'>): Promise<AuthResponse> {
    try {
      const existingUser = this.users.find(user => user.email === userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      const newUser: User = {
        ...userData,
        id: Date.now().toString()
      };

      this.users.push(newUser);
      this.currentUser = newUser;

      return {
        success: true,
        user: newUser,
        message: 'Registration successful'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Registration failed'
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const user = this.users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      this.currentUser = user;
      return {
        success: true,
        user: user,
        message: 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }

  async updateProfile(updates: Partial<Omit<User, 'id' | 'email'>>): Promise<AuthResponse> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          message: 'No user is currently logged in'
        };
      }

      const userIndex = this.users.findIndex(u => u.id === this.currentUser!.id);
      if (userIndex === -1) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      this.currentUser = this.users[userIndex];

      return {
        success: true,
        user: this.currentUser,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Profile update failed'
      };
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();
