import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { MapPin, Package, Truck, CheckCircle, Clock, Phone, User } from "lucide-react";
import { Button } from "../components/ui/button";

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  time: string;
  completed: boolean;
  icon: typeof Package;
}

interface Location {
  lat: number;
  lng: number;
  label: string;
}

export function DeliveryTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [driverLocation, setDriverLocation] = useState<Location>({
    lat: 40.7580,
    lng: -73.9855,
    label: "Driver Location"
  });

  const steps: TrackingStep[] = [
    {
      id: "1",
      title: "Order Confirmed",
      description: "Your order has been confirmed",
      time: "2:30 PM",
      completed: currentStep >= 0,
      icon: CheckCircle,
    },
    {
      id: "2",
      title: "Package Prepared",
      description: "Your package is being prepared",
      time: "2:45 PM",
      completed: currentStep >= 1,
      icon: Package,
    },
    {
      id: "3",
      title: "Out for Delivery",
      description: "Driver is on the way",
      time: currentStep >= 2 ? "3:10 PM" : "Pending",
      completed: currentStep >= 2,
      icon: Truck,
    },
    {
      id: "4",
      title: "Delivered",
      description: "Package delivered successfully",
      time: currentStep >= 3 ? "4:00 PM" : "Estimated",
      completed: currentStep >= 3,
      icon: CheckCircle,
    },
  ];

  // Simulate live location updates
  useEffect(() => {
    if (currentStep >= 2 && currentStep < 3) {
      const interval = setInterval(() => {
        setDriverLocation(prev => ({
          ...prev,
          lat: prev.lat + (Math.random() - 0.5) * 0.01,
          lng: prev.lng + (Math.random() - 0.5) * 0.01,
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  // Simulate delivery progress
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const deliveryAddress = "123 Main St, New York, NY 10001";
  const estimatedTime = currentStep >= 2 ? "25 minutes" : "45 minutes";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="px-3"
            >
              ← Back
            </Button>
            <div>
              <h1 className="font-semibold">Track Order</h1>
              <p className="text-sm text-gray-600">Order #{orderId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Live Map Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="size-5 text-blue-600" />
              Live Tracking
            </h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
              <div className="size-2 bg-green-600 rounded-full animate-pulse"></div>
              Live
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "300px" }}>
            {/* Simple map visualization */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
              {/* Grid lines to simulate map */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="absolute w-full h-px bg-gray-400" style={{ top: `${i * 10}%` }} />
                ))}
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="absolute h-full w-px bg-gray-400" style={{ left: `${i * 10}%` }} />
                ))}
              </div>

              {/* Destination marker */}
              <div className="absolute top-1/4 right-1/3 animate-bounce">
                <div className="bg-red-500 rounded-full p-2 shadow-lg">
                  <MapPin className="size-6 text-white" fill="currentColor" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow text-xs">
                  Your Home
                </div>
              </div>

              {/* Driver marker - animated */}
              {currentStep >= 2 && (
                <div 
                  className="absolute transition-all duration-3000 ease-linear"
                  style={{
                    top: `${45 + (driverLocation.lat - 40.7580) * 500}%`,
                    left: `${35 + (driverLocation.lng + 73.9855) * 500}%`,
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-blue-600 rounded-full p-2 shadow-lg">
                      <Truck className="size-6 text-white" />
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow text-xs">
                      Driver
                    </div>
                  </div>
                </div>
              )}

              {/* Route line */}
              {currentStep >= 2 && (
                <svg className="absolute inset-0 w-full h-full">
                  <line
                    x1="35%"
                    y1="45%"
                    x2="65%"
                    y2="25%"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeDasharray="10,5"
                    className="animate-pulse"
                  />
                </svg>
              )}
            </div>

            {/* Estimated time overlay */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600">Estimated arrival</p>
                  <p className="font-semibold">{estimatedTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Delivery Address</p>
            <p className="text-sm font-medium">{deliveryAddress}</p>
          </div>
        </div>

        {/* Driver Info */}
        {currentStep >= 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Driver Information</h2>
            <div className="flex items-center gap-4">
              <div className="size-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                JD
              </div>
              <div className="flex-1">
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-gray-600">Delivery Partner</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm">4.8 (2,450 deliveries)</span>
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Phone className="size-4" />
                Call
              </Button>
            </div>
          </div>
        )}

        {/* Delivery Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Delivery Status</h2>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = step.completed;

              return (
                <div key={step.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-blue-500 text-white animate-pulse"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 transition-all ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${isActive ? "text-blue-600" : ""}`}>
                        {step.title}
                      </h3>
                      <span className="text-sm text-gray-600">{step.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {isActive && currentStep === 2 && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                        <div className="size-2 bg-blue-600 rounded-full animate-pulse"></div>
                        Tracking in real-time
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 mb-2 font-medium">Need Help?</p>
          <p className="text-sm text-blue-700">
            Contact our support team at support@store.com or call 1-800-SUPPORT
          </p>
        </div>
      </div>
    </div>
  );
}
