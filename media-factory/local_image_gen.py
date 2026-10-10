import sys
import torch
from diffusers import StableDiffusionPipeline
import os

def generate_image(prompt, output_filename):
    print(f"[D9 Local Image] Rendering frame locally for: '{prompt}'")
    model_id = "runwayml/stable-diffusion-v1-5"
    
    try:
        # Load pipeline using local cache/weights
        pipe = StableDiffusionPipeline.from_pretrained(
            model_id, 
            torch_dtype=torch.float32,
            safety_checker=None
        )
        
        # Run inference locally
        image = pipe(prompt, num_inference_steps=15).images[0]
        
        output_path = os.path.join('/home/tim/MasterStudioServer/outputs/renders', output_filename)
        image.save(output_path)
        print(f"[D9 Local Image] Successfully saved frame to {output_path}")
        return output_path
    except Exception as e:
        print(f"[D9 Local Image Error]: {e}")
        # Fallback: Generate a clean placeholder image canvas if model weights aren't fully cached yet
        from PIL import Image, ImageDraw
        img = Image.new('RGB', (512, 512), color = (73, 109, 137))
        d = ImageDraw.Draw(img)
        d.text((10,10), prompt[:40], fill=(255,255,255))
        output_path = os.path.join('/home/tim/MasterStudioServer/outputs/renders', output_filename)
        img.save(output_path)
        print(f"[D9 Local Image] Saved canvas proxy to {output_path}")
        return output_path

if __name__ == "__main__":
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Super Puff comedy cartoon character"
    filename = sys.argv[2] if len(sys.argv) > 2 else "super_puff_frame.png"
    generate_image(prompt, filename)
