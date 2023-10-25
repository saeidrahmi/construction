import { Injectable, Signal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { CommonUtilityService } from './common-utility.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  commonUtility = inject(CommonUtilityService);
  apiService = inject(ApiService);
  isUserTokenValid(token: string): boolean {
    let tokenValid = signal<boolean>(false);
    if (!!token) {
      tokenValid.set(this.commonUtility.isTokenValid(token as string));
      if (tokenValid()) {
        tokenValid.mutate(
          toSignal(
            this.apiService.checkUserToken(token).pipe(
              tap((response) => {
                console.log('res', response);
              }),
              catchError((err) => {
                tokenValid.set(false);
                return of(false);
              })
            )
          )
        );
      } else {
        tokenValid.set(false);
      }
    } else {
      tokenValid.set(false);
    }

    return tokenValid();
  }

  constructionServices = [
    'General Contracting',
    'Design-Build',
    'Construction Management',
    'Residential Construction',
    'Commercial Construction',
    'Industrial Construction',
    'Civil Engineering and Infrastructure',
    'Renovation and Remodeling',
    'Demolition Services',
    'Excavation and Grading',
    'Foundation Construction',
    'Carpentry Services',
    'Masonry Services',
    'Electrical Services',
    'Plumbing Services',
    'HVAC (Heating, Ventilation, and Air Conditioning)',
    'Roofing Services',
    'Painting and Finishing',
    'Flooring Services',
    'Concrete Services',
    'Landscaping and Exterior Design',
    'Siding Installation',
    'Environmental Remediation',
    'Project Management and Consultation',
    'Sustainable and Green Building',
    'Interior Design',
    'Architectural Services',
    'Fire and Safety Systems',
    'Insulation Installation',
    'Custom Home Building',
    'New Home Construction',
    'Exterior Renovations',
    'Foundation and Structural Work',
    'Electrical Contracting',
    'Plumbing and HVAC',
    'Kitchen and Bathroom Remodeling',
    'Carpentry and Woodworking',
    'Flooring Installation',
    'Commercial Fit-Outs',
    'Institutional Construction',
    'Healthcare Facility Construction',
    'Educational Facility Construction',
    'Public Infrastructure Projects',
    'Bridge and Road Construction',
    'High-Rise Construction',
    'Low-Income Housing Projects',
    'Historical Building Restoration',
    'Steel and Metal Fabrication',
    'Modular and Prefabricated Building',
    'Residential and Commercial Maintenance',
    'Emergency Repairs and Restoration',
    'Interior and Exterior Insulation',
    'Solar Panel Installation',
    'Smart Home Integration',
    'Water Management Systems',
    'Sewer and Water Line Installation',
    'Elevator and Escalator Installation',
    'Fire and Security System Installation',
    'Asbestos Abatement',
    'Agricultural Construction',
    'Aquatic Construction (Pools, Water Features)',
    'Waste Management Facilities',
    'Airport and Aviation Infrastructure',
    'Railway Construction',
    'Data Center Construction',
    'Recreational Facilities (Stadiums, Arenas)',
    'Logistics and Warehouse Facilities',
    'Retail Store Construction',
    'Hospitality and Hotel Construction',
    'Oil and Gas Facilities',
    'Mining Infrastructure',
    'Agricultural Building Construction',
    'Residential Land Development',
    'Commercial Real Estate Development',
    'Custom Cabinetry and Millwork',
    'ADA Compliance and Accessibility',
    'Home Additions and Extensions',
    'Tiny Home Construction',
    'Shipping Container Conversions',
    'Solarium and Sunroom Construction',
    'Garage and Workshop Construction',
    'Barn and Agricultural Building Construction',
    'Wine Cellar Construction',
    'Wet Bar and Home Theater Installation',
    'Soundproofing and Acoustical Services',
    'Pest Control and Termite Removal',
    'Home Inspection Services',
    'Interior and Exterior Signage Installation',
    'Cemetery and Mausoleum Construction',
    'Theme Park and Amusement Ride Construction',
    'Zoo and Wildlife Enclosure Construction',
    'Art Gallery and Museum Construction',
    'Geotechnical and Soil Testing Services',
    'Disaster Recovery and Restoration',
    'Bunker and Safe Room Construction',
    'Interlocking and Paving',
    'Asphalt and Driveway Paving',
    'Retaining Wall Construction',
    'Deck and Patio Construction',
    'Fencing and Gate Installation',
    'Landscape Design and Installation',
    'Swimming Pool Construction',
    'Spa and Hot Tub Installation',
    'Outdoor Kitchen Construction',
    'Gazebo and Pergola Installation',
    'Fire Pit and Fireplace Construction',
    'Water Feature Installation',
    'Hardscaping Services',
    'Basement Finishing Services',
    'Softscaping and Garden Design',
    'Irrigation System Installation',
    'Tree and Shrub Planting',
    'Lawn Care and Maintenance',
    'Sod Installation and Seeding',
    'Awnings and Shade Structures',
    'Outdoor Lighting Installation',
    'Gutter and Downspout Installation',
    'Storm Drainage Systems',
    'Land Surveying and Mapping',
    'Geothermal Heating and Cooling',
    'Rainwater Harvesting Systems',
    'Playground and Recreational Area Construction',
    'Public Park and Trail Construction',
    'Golf Course Construction',
    'Tennis Court and Sports Facility Construction',
    'Sports Field and Stadium Construction',
    'Gym and Fitness Center Construction',
    'Skatepark and BMX Track Construction',
    'Waterfront and Marine Construction',
    'Marina and Dock Construction',
    'Boat Lift and Slip Installation',
    'Seawall and Bulkhead Construction',
    'Dredging and Waterway Management',
    'Coastal Erosion Control',
    'Agricultural Irrigation Systems',
    'Biomass and Bioenergy Facilities',
    'Greenhouse and Nursery Construction',
    'Fish Hatchery and Aquaculture Facilities',
    'Crop Storage and Silo Construction',
    'Livestock Barn and Facility Construction',
    'Grain Elevator and Mill Construction',
    'Warehouse and Distribution Center Construction',
    'Freight and Shipping Terminal Construction',
    'Cold Storage and Refrigeration Facilities',
    'Hazardous Material Remediation',
    'Nuclear Decommissioning Services',
    'Pipeline and Utility Installation',
    'Alternative Energy Infrastructure',
    'Telecommunications Tower Construction',
    'Military and Defense Facilities',
    'Prison and Detention Center Construction',
    'Government and Municipal Buildings',
    'Religious Building Construction',
    'Warehouse and Storage Facility Construction',
    'Green Building and LEED Certification',
    'Historical Preservation and Restoration',
    'Artificial Intelligence in Construction',
    'Augmented Reality for Construction',
    'Virtual Reality in Construction',
    'Blockchain Technology in Construction',
    'BIM (Building Information Modeling)',
    'Drones in Construction',
  ];

  getConstructionServices(): string[] {
    return this.constructionServices;
  }
  advertisementHeaders = [
    'Building Dreams, Crafting Excellence',
    'Your Vision, Our Expertise: Construction Services',
    'From Blueprint to Reality: Your Trusted Builders',
    'Quality Construction Services You Can Count On',
    'Transforming Spaces, Creating Value',
    'Crafting Your Perfect Space: Our Construction Experts',
    'Building Tomorrow, Today',
    'Your Project, Our Passion: Construction Excellence',
    'Unlocking the Potential of Your Property',
    'Constructing a Better Future Together',
    'Precision Construction for Lasting Impressions',
    'Where Design Meets Construction Perfection',
    'Innovative Building Solutions for Every Need',
    "Your Dream Home Awaits - Let's Build It!",
    'Expert Builders, Exceptional Results',
    'Building Trust One Project at a Time',
    'Turning Blueprints into Beautiful Realities',
    'Your Construction Partner for Success',
    'Crafting Spaces, Building Relationships',
    'Quality Construction, Unmatched Service',
  ];
  getAdvertisementHeaders(): string[] {
    return this.advertisementHeaders;
  }
  formatTimeDifference(dateCreated: Date): string {
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - dateCreated?.getTime();
    const minutes = Math.floor(timeDifference / 60000); // 1 minute = 60000 milliseconds
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    if (minutes < 1) {
      return `Now`;
    } else if (minutes === 30) {
      return `Half an hour ago`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (days < 7) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (days === 7) {
      return '1 week ago';
    } else if (days === 14) {
      return '2 week ago';
    } else if (days === 21) {
      return '3 week ago';
    } else if (days === 28) {
      return '4 week ago';
    } else if (days >= 1 && days != 30 && days != 60 && days != 90) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return `${months} month${months === 1 ? '' : 's'} ago`;
    }
  }
}
