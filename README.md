<img src="https://socialify.git.ci/Shantela21/React-Native-Restaurant-Application/image?language=1&owner=1&name=1&stargazers=1&theme=Light" alt="React-Native-Restaurant-Application" width="640" height="320" />


A fully functional restaurant app built with **React Native** and **Expo**, featuring user authentication, cart management, and multiple payment methods including **Paystack** integration.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication (login/signup)
- Browse menu items and view food details
- Add items to cart and checkout
- Payment via:
  - Paystack (credit/debit cards)
  - Saved cards
  - Cash on delivery
- Firebase integration for user and order management
- Toast notifications for actions and errors
- Responsive UI with Expo components
- State management using React Context and Redux Toolkit

## Installation

**1. Clone the repository:**

```bash
git clone https://github.com/Shantela21/reactnativerestaurantapp.git
```
```
cd reactnativerestaurantapp
```

**2. Install dependencies:**|

```bash
npm install
```

**3. Run the app:**

```bash
expo start
```

## Available options:

* Run on Android: npm run android
* Run on iOS: npm run ios
* Run on Web: npm run web

Reset project (clear caches and rebuild):
```
npm run reset-project
```

## Project Structure
```
reactnativerestaurantapp/
├── App.tsx
├── package.json
├── scripts/
│   └── reset-project.js
├── src/
│   ├── components/          # Reusable UI components
│   ├── constants/           # App constants like Colors
│   ├── context/             # Auth and Cart contexts
│   ├── navigation/          # Navigation setup (AppNavigator)
│   ├── screens/             # App screens (Checkout, Cart, FoodDetails, etc.)
│   └── services/            # API and Firebase services
└── assets/                  # Images, fonts, and icons
```

## Dependencies
* React Native & Expo: react-native, expo, expo-status-bar, expo-font, expo-image, etc.
* Navigation: @react-navigation/native, @react-navigation/native-stack, @react-navigation/bottom-tabs
* State Management: react-redux, @reduxjs/toolkit
* Firebase: firebase
* Payment: react-native-paystack-webview
* UI: react-native-elements, @expo/vector-icons
* Async Storage: @react-native-async-storage/async-storage
* Toast Notifications: react-native-toast-message

## Scripts
```
| Script          | Description                          |
| --------------- | ------------------------------------ |
| `start`         | Start Expo development server        |
| `android`       | Run app on Android device/emulator   |
| `ios`           | Run app on iOS simulator             |
| `web`           | Run app on web browser               |
| `lint`          | Lint project files using Expo config |
| `reset-project` | Clear cache and reset project setup  |
```

## Contributing

Contributions are welcome! Please follow standard GitHub flow:

1. Fork the repository
2. Create a feature branch
3. Make changes and commit
4. Submit a pull request