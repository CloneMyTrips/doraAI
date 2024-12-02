import os
from moviepy.editor import *
from instaloader import Post
import instaloader
import requests
import whisper
import sys

reels = sys.argv[1]
reels_id = reels.split('/')[4]

# Pega a url do reels
loader = instaloader.Instaloader()
post = Post.from_shortcode(loader.context, reels_id)
url = post.video_url
title = post.title
print('Title:', title)
captions = post.caption
print('Captions:', captions)

output_filename_mp4 = f"{reels_id}.mp4"
# Faz o download em mp4
response = requests.get(url, stream=True)
if response.status_code == 200:
    with open(output_filename_mp4, 'wb') as file:
        for chunk in response.iter_content(chunk_size=1024):
            if chunk:
                file.write(chunk)
                

output_filename_mp3 = f"{reels_id}.mp3"
# Converte o video em mp3
video = VideoFileClip(output_filename_mp4)
video.audio.write_audiofile(output_filename_mp3)

try:
    # Transcreve o mp3 para texto usando whisper
    model = whisper.load_model("base")
    result = model.transcribe(output_filename_mp3)
    print('Transcript: ', result["text"])
finally:
    # Delete temporary files
    try:
        os.remove(output_filename_mp4)
        os.remove(output_filename_mp3)
    except Exception as e:
        print(f"Error deleting temporary files: {e}")