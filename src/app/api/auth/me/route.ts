import { NextResponse } from "next/server";
import { getUserProfile, updateUserProfile } from "@/lib/db-operations";

// Get current user profile
export async function GET() {
  try {
    // TODO: Integrate with real authentication (e.g., Better Auth)
    // For now, we'll fetch the first user from the database
    const userId = 1; // Hardcoded for development
    
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }
    
    // Return user profile with auth info
    return NextResponse.json({
      id: userId,
      email: "adi@gmail.com",
      full_name: "adi",
      role: "admin",
      ...userProfile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// Update current user profile
export async function PUT(request: Request) {
  try {
    const userId = 1; // Hardcoded for development
    const data = await request.json();
    
    const updatedProfile = await updateUserProfile(userId, data);
    
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

