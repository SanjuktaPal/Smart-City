#Code for Route Optimization 

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def create_data_model(waste_bins):
    """Creates the data for the problem."""
    data = {}
    data['locations'] = [(bin['latitude'], bin['longitude']) for bin in waste_bins]
    data['num_vehicles'] = 3  # Number of waste collection vehicles
    data['depot'] = 0  # Start and end at the first location
    return data

def compute_euclidean_distance(point1, point2):
    """Computes the Euclidean distance between two points."""
    return int(((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)**0.5 * 1000)

def optimize_routes(waste_bins):
    """Optimize routes for waste collection."""
    data = create_data_model(waste_bins)

    manager = pywrapcp.RoutingIndexManager(len(data['locations']), data['num_vehicles'], data['depot'])
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return compute_euclidean_distance(data['locations'][from_node], data['locations'][to_node])

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        routes = []
        for vehicle_id in range(data['num_vehicles']):
            index = routing.Start(vehicle_id)
            route = []
            while not routing.IsEnd(index):
                route.append(manager.IndexToNode(index))
                index = solution.Value(routing.NextVar(index))
            route.append(manager.IndexToNode(index))
            routes.append(route)
        return routes
    return None

# Usage
waste_bins = [
    {'latitude': 40.7128, 'longitude': -74.0060, 'fill_level': 80},
    {'latitude': 40.7123, 'longitude': -74.0050, 'fill_level': 60},
    # Add more waste bins...
]

optimized_routes = optimize_routes(waste_bins)
print(optimized_routes)
