import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function useImageUpload() {
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      console.log('Uploading file:', file.type); // Log file type
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        console.log('File read as data URL:', imageUrl.substring(0, 50) + '...'); // Log start of data URL
        
        // Dispatch event with image data
        const event = new CustomEvent('addImage', {
          detail: { imageUrl, fileType: file.type }
        });
        window.dispatchEvent(event);
        
        // Close the design options toolbar after successful upload
        if (window.innerWidth < 1024) {
          const closeToolbarEvent = new CustomEvent('closeDesignOptionsToolbar');
          window.dispatchEvent(closeToolbarEvent);
        }
        
        toast.success('Image uploaded successfully');
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error); // Log reader error
        toast.error('Failed to read image file');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  }, []);

  return { handleImageUpload };
}