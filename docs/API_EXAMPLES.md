# API examples

Set a token after registering or logging in:

```bash
TOKEN="paste-jwt-here"
```

## Register rider

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Rider","email":"rider@example.com","password":"Rider123!","role":"rider"}'
```

## Register driver

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Driver","email":"driver@example.com","password":"Driver123!","role":"driver","vehicle":{"type":"car","make":"Hyundai","model":"i20","plateNumber":"MH01AB1234"}}'
```

## Update driver location

```bash
curl -X PATCH http://localhost:5000/api/drivers/location \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"coordinates":[72.8777,19.0760]}'
```

## Request a ride

```bash
curl -X POST http://localhost:5000/api/rides \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "pickup":{"address":"Gateway of India, Mumbai","coordinates":[72.8347,18.9220]},
    "destination":{"address":"Bandra Station, Mumbai","coordinates":[72.8402,19.0544]},
    "distanceKm":16.2,"durationMinutes":42,"vehicleType":"car","paymentMethod":"upi"
  }'
```
