"use server"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ActionState } from "@/types"

/**
 * Deletes a file from a specified Supabase Storage bucket.
 *
 * @param bucket The name of the bucket.
 * @param path The path of the file within the bucket.
 * @returns ActionState indicating success or failure.
 */
export async function deleteFileStorageAction(
  bucket: string,
  path: string
): Promise<ActionState<void>> {
  const supabase = createClientComponentClient()

  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error("Error deleting file from storage:", error)
      throw new Error(`Failed to delete file: ${error.message}`)
    }

    return {
      isSuccess: true,
      message: "File deleted successfully from storage",
      data: undefined
    }
  } catch (error) {
    console.error("Error in deleteFileStorageAction:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { isSuccess: false, message: `Failed to delete file: ${errorMessage}` }
  }
}

/**
 * Uploads a file to a specified Supabase Storage bucket.
 *
 * @param bucket The name of the bucket.
 * @param path The desired path for the file within the bucket.
 * @param file The File object to upload.
 * @param upsert Whether to overwrite an existing file at the same path (default: false).
 * @returns ActionState containing the path of the uploaded file or an error message.
 */
export async function uploadFileStorageAction(
  bucket: string,
  path: string,
  file: File,
  upsert: boolean = false
): Promise<ActionState<{ path: string }>> {
  const supabase = createClientComponentClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600', // Optional: Cache control headers
        upsert: upsert,
        contentType: file.type // Ensure correct content type is set
      })

    if (error) {
      console.error("Error uploading file to storage:", error)
      throw new Error(`Storage upload failed: ${error.message}`)
    }

    if (!data || !data.path) {
      console.error("Storage upload returned no path")
      throw new Error("Storage upload succeeded but returned no path.")
    }

    return {
      isSuccess: true,
      message: "File uploaded successfully to storage",
      data: { path: data.path }
    }
  } catch (error) {
    console.error("Error in uploadFileStorageAction:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during upload"
    return { isSuccess: false, message: `File upload failed: ${errorMessage}` }
  }
} 