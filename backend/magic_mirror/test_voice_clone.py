"""Test script for voice cloning using provided audio samples."""

from pathlib import Path
from voice_cloner import VoiceCloner


def main():
    print("🎙️  Initializing Voice Cloner...")
    print("Note: First run will download the XTTS v2 model (~2GB)")
    print("-" * 60)
    
    cloner = VoiceCloner()
    
    # Use one of the provided audio samples as reference
    # Using the longest one for best results
    wav_dir = Path(__file__).parent / "wav"
    speaker_wav = str(wav_dir / "swamp-outhouse.mp3")  # Longest sample
    
    print(f"📁 Using reference audio: {speaker_wav}")
    print("-" * 60)
    
    # Test texts to synthesize
    test_texts = [
        "Hello, this is a test of voice cloning technology.",
        "The weather today is quite pleasant, don't you think?",
        "I'm excited to see how well this voice cloning works!",
    ]
    
    # Generate cloned voices
    for i, text in enumerate(test_texts, 1):
        output_file = f"cloned_output_{i}.wav"
        print(f"\n🔊 Generating speech {i}/3...")
        print(f"   Text: \"{text}\"")
        
        cloner.clone_to_file(
            text=text,
            speaker_wav=speaker_wav,
            output_path=output_file,
            language="en"
        )
        
        print(f"   ✅ Saved to: {output_file}")
    
    print("\n" + "=" * 60)
    print("🎉 Voice cloning complete!")
    print("=" * 60)
    print(f"Generated {len(test_texts)} audio files:")
    for i in range(1, len(test_texts) + 1):
        print(f"  - cloned_output_{i}.wav")
    print("\nPlay them to hear the cloned voice!")


if __name__ == "__main__":
    main()

