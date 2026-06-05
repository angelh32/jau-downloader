import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.downloader import check_extractor, _format_resolution_info


def test_check_extractor_facebook_share_url():
    assert check_extractor("https://www.facebook.com/share/r/test") == "facebook"


def test_check_extractor_facebook_watch():
    assert check_extractor("https://www.facebook.com/watch?v=test") == "facebook"


def test_check_extractor_facebook_video():
    assert check_extractor("https://www.facebook.com/someuser/videos/test") == "facebook"


def test_check_extractor_facebook_reel():
    assert check_extractor("https://www.facebook.com/reel/test") == "facebook"


def test_check_extractor_youtube():
    assert check_extractor("https://www.youtube.com/watch?v=test").startswith("youtube")


def test_check_extractor_vimeo():
    assert check_extractor("https://vimeo.com/123456789") == "vimeo"


def test_check_extractor_invalid_url():
    assert check_extractor("https://example.com/video") == ""


def test_format_resolution_info_facebook():
    test_data = [
        {
            "format_id": "817907324162120a",
            "ext": "m4a",
            "width": None,
            "height": None,
            "vcodec": "none",
            "acodec": "mp4a.40.5",
            "resolution": "audio only",
            "format": "817907324162120a - audio only (DASH audio)",
        },
        {
            "format_id": "hd",
            "ext": "mp4",
            "video_ext": "mp4",
            "audio_ext": "none",
            "resolution": None,
            "format": "hd - unknown",
        },
        {
            "format_id": "1334946971674352v",
            "ext": "mp4",
            "width": 720,
            "height": 1280,
            "format": "1459415575354094v - 720x1280 (DASH video)",
            "vcodec": "av01.0.05M.08.0.111",
            "acodec": "none",
            "resolution": "720x1280",
        },
    ]

    result = _format_resolution_info(test_data)
    print (result)
    assert any(f["format"] == "hd" for f in result)
    assert any(f["format"] == "720x1280 (DASH video)" for f in result)
    assert any(f["format"] == "audio only (DASH audio)" for f in result)
