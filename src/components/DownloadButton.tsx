import React from 'react';
import { Download } from 'lucide-react';
import { useSticker } from '../context/StickerContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function DownloadButton() {
  const { downloadSticker, downloadStickerSVG } = useSticker();

  const handleDownload = async (format: 'png' | 'svg') => {
    try {
      if (format === 'png') {
        await downloadSticker();
      } else {
        await downloadStickerSVG();
      }
    } catch (error) {
      console.error(`Error downloading ${format.toUpperCase()}:`, error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="px-2 sm:px-3"
        >
          <Download className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload('png')}>
          Download PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('svg')}>
          Download SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}