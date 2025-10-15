import numpy


rng = numpy.random.default_rng(45)

n_stations = 100
tlv = [10, 30]
points = rng.uniform(low=[54.81, 82.87], high=[55.16, 83.21], size=(n_stations, 2))

pm = numpy.round(rng.gamma((3, 5), (2, 4), (n_stations, 2)), 2)
stations = []
for idx, tpl in enumerate(list(zip(points, pm))):
    stations.append({'id': idx, 'latitude': float(tpl[0][0]), 'longitude': float(tpl[0][1]), 'PM_2_5': float(tpl[1][0]), 'PM_10': float(tpl[1][1]), 'overTLV': int((tpl[1] > tlv).any())})
