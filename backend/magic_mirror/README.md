# Magic Mirror - Voice Cloning Module - Testing 

A Python module for voice cloning using Coqui TTS with the XTTS v2 model.

## Features

- **Voice Cloning**: Clone any voice from a 3+ second audio sample
- **Multilingual Support**: Supports 16 languages
- **Easy API**: Simple Python interface for text-to-speech synthesis
- **GPU Acceleration**: Automatically uses GPU if available

## Installation

From the magic_mirror directory, install dependencies:

```bash
uv pip install -e .
```

Or with pip:

```bash
pip install -e .
```

**Note**: The XTTS v2 model will be downloaded automatically on first use (~2GB).

## Quick Start

```python
from magic_mirror.voice_cloner import VoiceCloner

# Initialize the voice cloner (downloads model on first run)
cloner = VoiceCloner()

# Clone a voice and save to file
cloner.clone_to_file(
    text="Hello, this is my cloned voice speaking!",
    speaker_wav="path/to/reference_audio.wav",  # 3+ seconds recommended
    output_path="output.wav",
    language="en"
)

# Or get the audio as a waveform array
wav = cloner.clone_to_wav(
    text="This returns audio as amplitude values.",
    speaker_wav="path/to/reference_audio.wav",
    language="en"
)
```

## Supported Languages

The XTTS v2 model supports the following languages:

| Language | Code |
|----------|------|
| English | `en` |
| Spanish | `es` |
| French | `fr` |
| German | `de` |
| Italian | `it` |
| Portuguese | `pt` |
| Polish | `pl` |
| Turkish | `tr` |
| Russian | `ru` |
| Dutch | `nl` |
| Czech | `cs` |
| Arabic | `ar` |
| Chinese | `zh-cn` |
| Japanese | `ja` |
| Hungarian | `hu` |
| Korean | `ko` |

## API Reference

### VoiceCloner

Main class for voice cloning operations.

#### `__init__(model_name: str = "tts_models/multilingual/multi-dataset/xtts_v2")`

Initialize the VoiceCloner.

**Parameters:**
- `model_name` (str): Name of the TTS model to use. Defaults to XTTS v2.

#### `clone_to_file(text: str, speaker_wav: str, output_path: str, language: str = "en") -> None`

Clone a voice and save the result to a file.

**Parameters:**
- `text` (str): Text to synthesize
- `speaker_wav` (str): Path to reference audio file (3+ seconds recommended)
- `output_path` (str): Path where the output audio will be saved
- `language` (str): Language code (default: "en")

#### `clone_to_wav(text: str, speaker_wav: str, language: str = "en") -> list`

Clone a voice and return the audio waveform.

**Parameters:**
- `text` (str): Text to synthesize
- `speaker_wav` (str): Path to reference audio file (3+ seconds recommended)
- `language` (str): Language code (default: "en")

**Returns:**
- list: Audio waveform as amplitude values

## Tips for Best Results

1. **Reference Audio Quality**: Use clear audio samples with minimal background noise
2. **Audio Length**: 3-10 seconds of reference audio works best
3. **GPU Usage**: The model runs much faster on GPU. CPU inference is supported but slower.
4. **First Run**: The first initialization will download the model (~2GB), which may take a few minutes depending on your connection.

## Requirements

- Python >= 3.12
- PyTorch >= 2.0.0
- coqui-tts >= 0.24.2 (maintained fork with Python 3.12 support)
- CUDA-compatible GPU (optional, for faster inference)

## Troubleshooting

### Model Download Issues
If the model fails to download, try:
```python
# Initialize with explicit model download
cloner = VoiceCloner()
```

### Memory Issues
The XTTS v2 model requires significant memory. If you encounter out-of-memory errors:
- Close other applications
- Use a machine with more RAM/VRAM
- Consider using a smaller model (though voice quality may be reduced)

### Audio Format Issues
Supported input formats: WAV, MP3, FLAC, OGG. If you have issues with a specific format, try converting to WAV first.

## License

This module uses Coqui TTS, which is released under the Mozilla Public License 2.0.

