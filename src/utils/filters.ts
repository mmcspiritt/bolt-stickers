import { fabric } from 'fabric';

export const filters = {
  none: null,
  grayscale: new fabric.Image.filters.Grayscale(),
  sepia: new fabric.Image.filters.Sepia(),
  invert: new fabric.Image.filters.Invert(),
  blur: new fabric.Image.filters.Blur({ blur: 0.25 }),
  sharpen: new fabric.Image.filters.Convolute({
    matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0]
  }),
  vintage: new fabric.Image.filters.Vintage()
};

export function applyFilter(image: fabric.Image, filterName: keyof typeof filters) {
  const filter = filters[filterName];
  image.filters = filter ? [filter] : [];
  image.applyFilters();
} 