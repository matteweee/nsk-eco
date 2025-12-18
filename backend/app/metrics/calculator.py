def calculate_messages_per_second(
    stations: list[dict],
    mode: str,
    cluster_count: int = 0,
    fake_pollutions: int = 0,
) -> int:

    if mode in ("timezone", "clusters"):
        return len(stations)

    if mode == "cluster_head":
        polluted = sum(1 for s in stations if s["overTLV"])
        return cluster_count + polluted + fake_pollutions
