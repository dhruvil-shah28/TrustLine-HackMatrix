import sys
from PIL import Image

try:
    src_path = r'public\brand\trustline-full.png'
    dest_path = r'public\brand\trustline-logo-trim.png'
    
    img = Image.open(src_path).convert('RGBA')
    data = img.load()
    w, h = img.size
    
    min_x, max_x = w, 0
    min_y, max_y = h, 0
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = data[x, y]
            is_white = (r >= 245 and g >= 245 and b >= 245)
            if a > 10 and not is_white:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    if min_x <= max_x and min_y <= max_y:
        pad = 2
        min_x = max(0, min_x - pad)
        max_x = min(w - 1, max_x + pad)
        min_y = max(0, min_y - pad)
        max_y = min(h - 1, max_y + pad)
        
        cropped = img.crop((min_x, min_y, max_x + 1, max_y + 1))
        cropped.save(dest_path)
        print(f"Cropped form size: {cropped.size}")
    else:
        print("No valid geometry found for cropping.")
except Exception as e:
    print(f"Error executing python pillow filter: {e}")
