import re


def extract_rfp_selection(message: str, rfps_identified: list) -> str:
    """Extract RFP ID from user selection message."""
    message_lower = message.lower()

    for rfp in rfps_identified:
        rfp_id = rfp.get("rfp_id", "")
        if rfp_id.lower() in message_lower:
            return rfp_id

    numbers = re.findall(r"\b(\d+)\b", message)
    for num in numbers:
        idx = int(num) - 1
        if 0 <= idx < len(rfps_identified):
            return rfps_identified[idx].get("rfp_id", "")

    selection_patterns = [
        r"select.*?(\d+)",
        r"choose.*?(\d+)",
        r"option.*?(\d+)",
        r"#(\d+)",
        r"number.*?(\d+)",
        r"rfp.*?(\d+)",
    ]

    for pattern in selection_patterns:
        match = re.search(pattern, message_lower)
        if match:
            idx = int(match.group(1)) - 1
            if 0 <= idx < len(rfps_identified):
                return rfps_identified[idx].get("rfp_id", "")

    return ""


def is_scan_request(message: str) -> bool:
    """Check if user wants to scan for RFPs."""
    keywords = ["scan", "find", "search", "show", "list", "rfp", "tender", "cable", "wire"]
    message_lower = message.lower()
    return any(kw in message_lower for kw in keywords)


def is_selection_request(message: str) -> bool:
    """Check if user is selecting an RFP."""
    keywords = ["select", "choose", "pick", "option", "number", "go with", "analyze", "#"]
    message_lower = message.lower()
    if any(kw in message_lower for kw in keywords):
        return True
    return re.search(r"\b\d+\b", message_lower) is not None
