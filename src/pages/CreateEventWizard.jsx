import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, Card, Spinner, Modal } from '../components';
import { eventService } from '../services/eventService';
import { analyzeRequirements, fetchRecommendations, fetchQuote } from '../services/aiService';
import { useToast } from '../contexts/ToastContext';
import { 
  CalendarIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  MapPinIcon,
  SparklesIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

// Fixed lists according to specification section 10.3
const EVENT_TYPES = ["mariage", "anniversaire", "entreprise", "cocktail", "concert"];
const SERVICES = ["traiteur", "dj", "décoration", "photographie"];

const CreateEventWizard = () => {
  const { eventId } = useParams(); // For editing existing draft
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [quote, setQuote] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(eventId || null);

  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Step 1: Event Type & Basic Info
    name: '',
    description: '',
    type: '',
    
    // Step 2: Date & Time
    date: '',
    startTime: '',
    endTime: '',
    
    // Step 3: Location & Guests
    city: '',
    guestCount: '',
    
    // Step 4: Budget & Services
    budget: '',
    services: [],
  });

  // Load existing draft if eventId is provided (section 10.8)
  useEffect(() => {
    if (eventId) {
      loadDraft(eventId);
    }
  }, [eventId]);

  const loadDraft = async (id) => {
    try {
      setIsLoading(true);
      console.log('Loading draft with ID:', id);
      const response = await eventService.getEventById(id);
      console.log('Draft response:', response);
      
      // Handle different response structures
      const event = response.data?.event || response.data || response.event || response;
      console.log('Extracted event data:', event);
      
      if (!event) {
        throw new Error('No event data found');
      }

      // Set the current event ID first
      setCurrentEventId(event.id || id);
      
      // Populate form data
      const formDataToSet = {
        name: event.name || event.title || '',
        description: event.description || '',
        type: event.type || '',
        date: event.date ? event.date.split('T')[0] : '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        city: event.city || '',
        guestCount: event.guestCount ? event.guestCount.toString() : '',
        budget: event.budget ? event.budget.toString() : '',
        services: event.services || [],
      };
      
      console.log('Setting form data:', formDataToSet);
      setFormData(formDataToSet);

      // Determine current step based on completed data (first incomplete step)
      if (!event.name && !event.title) {
        setCurrentStep(1);
      } else if (!event.date || !event.startTime) {
        setCurrentStep(2);
      } else if (!event.city || !event.guestCount) {
        setCurrentStep(3);
      } else if (!event.budget || !event.services?.length) {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
        // If all data is complete, fetch recommendations
        await handleFetchRecommendations(event.guestCount, event.budget);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      showError('Failed to load draft: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'services') {
      setFormData(prev => ({
        ...prev,
        services: checked 
          ? [...prev.services, value]
          : prev.services.filter(s => s !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  // Step 1: Create draft (section 10.2)
  const createDraft = async () => {
    try {
      console.log('Starting draft creation with data:', {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        status: 'draft'
      });
      setIsLoading(true);
      const response = await eventService.createEvent({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        status: 'draft'
      });
      
      console.log('Create event response:', response);
      const eventId = response.event?.id || response.data?.id || response.id;
      console.log('Extracted event ID:', eventId);
      setCurrentEventId(eventId);
      showSuccess('Brouillon créé avec succès!');
      return eventId;
    } catch (error) {
      console.error('Error creating draft:', error);
      showError('Échec de la création du brouillon: ' + (error.response?.data?.message || error.message));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Update event dates (section 10.2)
  const updateEventDates = async () => {
    console.log("In here: ")
    try {
      setIsLoading(true);
      await eventService.patchEvent(currentEventId, {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      showSuccess('Event dates updated!');
    } catch (error) {
      showError('Failed to update dates: ' + (error.response?.data?.message || error.message));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Update location and guests (section 10.2)
  const updateLocationGuests = async () => {
    try {
      setIsLoading(true);
      await eventService.patchEvent(currentEventId, {
        city: formData.city,
        guestCount: parseInt(formData.guestCount),
      });
      showSuccess('Location and guest count updated!');
    } catch (error) {
      showError('Failed to update location: ' + (error.response?.data?.message || error.message));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Update budget and services (section 10.2)
  const updateBudgetServices = async () => {
    try {
      setIsLoading(true);
      await eventService.patchEvent(currentEventId, {
        budget: parseFloat(formData.budget),
        services: formData.services,
      });
      showSuccess('Budget and services updated!');
    } catch (error) {
      showError('Failed to update budget: ' + (error.response?.data?.message || error.message));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: AI analyze requirements (section 10.2)
  const handleAnalyzeRequirements = async () => {
    try {
      setIsAnalyzing(true);
      await analyzeRequirements(currentEventId);
      showSuccess('Requirements analyzed with AI!');
    } catch (error) {
      showError('AI analysis failed: ' + (error.response?.data?.message || error.message));
      // Error/Retry pattern (section 10.9)
      if (error.response?.status === 500) {
        showError('Service temporarily unavailable – please retry');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 5: Fetch AI recommendations (section 10.2)
  const handleFetchRecommendations = async (guestCount, budget) => {
    try {
      setIsLoading(true);
      const response = await fetchRecommendations(
        parseInt(guestCount || formData.guestCount),
        parseFloat(budget || formData.budget)
      );
      const venues = response.data?.venues || response.data || [];
      setRecommendations(venues);
      showSuccess('AI recommendations generated!');
    } catch (error) {
      showError('Failed to get recommendations: ' + (error.response?.data?.message || error.message));
      // Error/Retry pattern (section 10.9)
      if (error.response?.status === 500) {
        showError('Service temporarily unavailable – please retry');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 6: Quote modal (section 10.7)
  const handleQuoteRequest = async (venue) => {
    setSelectedVenue(venue);
    setIsLoadingQuote(true);
    setShowQuoteModal(true);

    try {
      const response = await fetchQuote(venue.id, currentEventId);
      setQuote(response.data);
    } catch (error) {
      showError('Failed to generate quote: ' + (error.response?.data?.message || error.message));
      setShowQuoteModal(false);
      // Error/Retry pattern (section 10.9)
      if (error.response?.status === 500) {
        showError('Service temporarily unavailable – please retry');
      }
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Accept quote (section 10.7)
  const handleAcceptQuote = async () => {
    try {
      // Call POST /quotes/:id/accept
      await eventService.acceptQuote(quote.id);
      showSuccess('Quote accepted! Provider has been notified.');
      setShowQuoteModal(false);
      navigate('/dashboard');
    } catch (error) {
      showError('Failed to accept quote: ' + (error.response?.data?.message || error.message));
    }
  };

  // Retry functionality (section 10.9)
  const retryStep = async () => {
    setError('');
    try {
      if (currentStep === 4) {
        await updateBudgetServices();
        await handleAnalyzeRequirements();
        await handleFetchRecommendations(formData.guestCount, formData.budget);
        setCurrentStep(5);
      } else if (currentStep === 5) {
        await handleFetchRecommendations(formData.guestCount, formData.budget);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Navigation logic
  const nextStep = async () => {
    setError('');
    
    try {
      if (currentStep === 1) {
        // Create draft if we don't have an event ID yet
        if (!currentEventId) {
          console.log('Creating draft...');
          const eventId = await createDraft();
          console.log('Draft created with ID:', eventId);
          if (!eventId) {
            console.error('Failed to create draft - no event ID returned');
            return;
          }
          // Update the state with the new event ID
          setCurrentEventId(eventId);
        }
        console.log('Moving to step 2...');
        setCurrentStep(2);
      } else if (currentStep === 2) {
        await updateEventDates();
        setCurrentStep(3);
      } else if (currentStep === 3) {
        await updateLocationGuests();
        setCurrentStep(4);
      } else if (currentStep === 4) {
        await updateBudgetServices();
        await handleAnalyzeRequirements();
        await handleFetchRecommendations(formData.guestCount, formData.budget);
        setCurrentStep(5);
      }
    } catch (error) {
      console.error('Error in nextStep:', error);
      setError(error.message);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-primary-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Event Type & Details</h2>
              <p className="text-gray-600">Tell us about your event</p>
            </div>

            <Input
              label="Event Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="My Amazing Event"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option value="">Select event type...</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                placeholder="Describe your event..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-primary-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Date & Time</h2>
              <p className="text-gray-600">When will your event take place?</p>
            </div>

            <Input
              label="Event Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
              />

              <Input
                label="End Time"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <MapPinIcon className="mx-auto h-12 w-12 text-primary-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Location & Guests</h2>
              <p className="text-gray-600">Where and how many people?</p>
            </div>

            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="New York"
              required
            />

            <Input
              label="Expected Number of Guests"
              name="guestCount"
              type="number"
              value={formData.guestCount}
              onChange={handleChange}
              placeholder="50"
              min="1"
              required
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-primary-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Budget & Services</h2>
              <p className="text-gray-600">What's your budget and what services do you need?</p>
            </div>

            <Input
              label="Total Budget ($)"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              placeholder="5000"
              min="0"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Required Services
              </label>
              <div className="grid grid-cols-2 gap-4">
                {SERVICES.map((service) => (
                  <label
                    key={service}
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      name="services"
                      value={service}
                      checked={formData.services.includes(service)}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                      {service}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {isAnalyzing && (
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
                <span className="ml-2 text-sm text-gray-600">Analyzing requirements with AI...</span>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <SparklesIcon className="mx-auto h-12 w-12 text-primary-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">AI Venue Suggestions</h2>
              <p className="text-gray-600">Based on your requirements, here are the best venues</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
                <span className="ml-2">Getting AI recommendations...</span>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((venue, index) => (
                  <Card key={venue.id || index} className="text-left">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                      <span className="text-primary-600 font-bold">
                        ${venue.estimatedCost || venue.basePrice || 'TBD'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{venue.location || venue.address}</p>
                    <p className="text-gray-500 text-sm mb-3">{venue.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600">✓ Available</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleQuoteRequest(venue)}
                      >
                        Get Quote
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No recommendations available. Please try again.</p>
                <Button 
                  variant="outline" 
                  onClick={retryStep}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            )}

            <div className="flex justify-center space-x-4 pt-6">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Sauvegarder le brouillon
              </Button>
              <Button onClick={() => navigate('/venues')}>
                Browse All Venues
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepProgress = () => {
    return (currentStep / 5) * 100;
  };

  if (isLoading && currentStep === 1 && eventId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading draft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Étape {currentStep} sur 5</span>
            <span>{Math.round(getStepProgress())}% Terminé</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {currentEventId ? 'Modifier le brouillon d\'événement' : 'Créer un nouvel événement'}
          </h1>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex items-center justify-between">
              <p className="text-red-700 text-sm">{error}</p>
              <Button size="sm" variant="outline" onClick={retryStep}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <Card>
          {renderStep()}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Précédent
              </Button>

              <Button
                onClick={() => {
                  console.log('Next button clicked, currentStep:', currentStep);
                  console.log('Form data:', formData);
                  console.log('Button disabled?', 
                    (currentStep === 1 && (!formData.name || !formData.type)) ||
                    (currentStep === 2 && (!formData.date || !formData.startTime)) ||
                    (currentStep === 3 && (!formData.city || !formData.guestCount)) ||
                    (currentStep === 4 && (!formData.budget || !formData.services.length))
                  );
                  nextStep();
                }}
                isLoading={isLoading || isAnalyzing}
                disabled={
                  (currentStep === 1 && (!formData.name || !formData.type)) ||
                  (currentStep === 2 && (!formData.date || !formData.startTime)) ||
                  (currentStep === 3 && (!formData.city || !formData.guestCount)) ||
                  (currentStep === 4 && (!formData.budget || !formData.services.length))
                }
              >
                {isLoading || isAnalyzing ? 'Traitement...' : 'Suivant'}
              </Button>
            </div>
          )}
        </Card>

        {/* Quote Modal */}
        <Modal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          title={`Quote for ${selectedVenue?.name}`}
        >
          {isLoadingQuote ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
              <span className="ml-2">Generating AI-powered quote...</span>
            </div>
          ) : quote ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Quote Breakdown</h4>
                {quote.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.description}</span>
                    <span>${item.amount}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${quote.total}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowQuoteModal(false)}>
                  Decline
                </Button>
                <Button onClick={handleAcceptQuote}>
                  Accept Quote
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Failed to generate quote. Please try again.</p>
              <Button 
                variant="outline" 
                onClick={() => handleQuoteRequest(selectedVenue)}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CreateEventWizard;
