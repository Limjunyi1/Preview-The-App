"""Test script to measure latency and performance of voice cloning."""

import time
import soundfile as sf
from pathlib import Path
from voice_cloner import VoiceCloner

def main():
    print("⏱️  Starting Latency Test...")
    print("-" * 60)

    # 1. Measure Initialization Time
    start_time = time.time()
    cloner = VoiceCloner()
    init_time = time.time() - start_time
    print(f"🚀 Model Initialization: {init_time:.4f} seconds")
    print(f"   Device: {cloner.device}")
    print("-" * 60)

    # Setup reference audio
    wav_dir = Path(__file__).parent / "wav"
    speaker_wav = str(wav_dir / "swamp-outhouse.mp3")
    
    # Test cases with different lengths
    test_cases = [
        ("Short", "Hello."),
        ("Medium", "This is a medium length sentence to test processing speed."),
        ("Long", "This is a much longer paragraph that is intended to test how the model performs when generating a significant amount of speech content in a single pass, which typically takes more time.")
    ]

    total_gen_time = 0
    total_audio_duration = 0

    for name, text in test_cases:
        print(f"\nTesting: {name} ({len(text)} chars)")
        
        # Measure Synthesis Time
        start_gen = time.time()
        # Using clone_to_wav to skip file saving overhead in measurement
        wav_data = cloner.clone_to_wav(
            text=text,
            speaker_wav=speaker_wav,
            language="en"
        )
        gen_time = time.time() - start_gen
        
        # Calculate Audio Duration (assuming 24kHz sample rate for XTTS)
        # Note: The output is a list of floats, we need to estimate duration
        # XTTS v2 output sample rate is typically 24000 Hz
        sample_rate = 24000
        audio_duration = len(wav_data) / sample_rate
        
        rtf = gen_time / audio_duration if audio_duration > 0 else 0
        
        print(f"   Processing Time : {gen_time:.4f}s")
        print(f"   Audio Duration  : {audio_duration:.4f}s")
        print(f"   Real-time Factor: {rtf:.4f} (Lower is better)")
        print(f"   Speedup         : {1/rtf:.2f}x real-time")

        total_gen_time += gen_time
        total_audio_duration += audio_duration

    print("\n" + "=" * 60)
    print("📊 Summary")
    print("=" * 60)
    if total_audio_duration > 0:
        avg_rtf = total_gen_time / total_audio_duration
        print(f"Average RTF: {avg_rtf:.4f}")
        print(f"Average Speed: {1/avg_rtf:.2f}x real-time")
    print(f"Total Audio Generated: {total_audio_duration:.2f}s")
    print(f"Total Processing Time: {total_gen_time:.2f}s")

if __name__ == "__main__":
    main()