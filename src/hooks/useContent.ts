import { useState, useEffect } from 'react';
import { contentService } from '@/services/contentService';
import type { Service, Testimonial, FAQItem, CoverageArea, PricingItem, ConveniencePass } from '@/types';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await contentService.getServices();
        setServices(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await contentService.getTestimonials();
        setTestimonials(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return { testimonials, loading, error };
}

export function useFAQ() {
  const [faq, setFaq] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const data = await contentService.getFAQ();
        setFaq(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQ();
  }, []);

  return { faq, loading, error };
}

export function useCoverageAreas() {
  const [areas, setAreas] = useState<CoverageArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await contentService.getCoverageAreas();
        setAreas(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  return { areas, loading, error };
}

export function usePricing() {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [passes, setPasses] = useState<ConveniencePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const [pricingData, passesData] = await Promise.all([
          contentService.getPricing(),
          contentService.getConveniencePasses(),
        ]);
        setPricing(pricingData);
        setPasses(passesData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  return { pricing, passes, loading, error };
}
