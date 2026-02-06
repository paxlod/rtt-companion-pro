# How to Build the APK

The Android project has been successfully initialized using Capacitor.

## Prerequisites
- **Java Development Kit (JDK) 17**: Required for Gradle.
- **Android SDK**: Required for building Android apps.

## Build Steps

1.  **Open the Android Project**:
    The native Android project is located in the `android/` directory.

2.  **Build from Command Line**:
    Navigate to the `android` directory and run the Gradle wrapper:

    ```bash
    cd android
    ./gradlew assembleDebug
    ```

    The generated APK will be located at:
    `android/app/build/outputs/apk/debug/app-debug.apk`

3.  **Build using Android Studio**:
    - Open Android Studio.
    - Select "Open an existing Android Studio project".
    - Select the `android` directory within this project.
    - Wait for Gradle sync to complete.
    - Go to `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

## Troubleshooting Termux
If you are trying to build this directly on the device (Termux) and encountered errors installing Java:
- Ensure your Termux repositories are up to date (`termux-change-repo`).
- Install OpenJDK 17: `pkg install openjdk-17`.
- Then run the command in step 2.
