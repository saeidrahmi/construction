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
              tap((response) => {}),
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
    'Architectural Design',
    'Interior Design',
    'General Contracting',
    'Electrical Work',
    'Plumbing Services',
    'HVAC Installation',
    'Roofing and Siding',
    'Landscaping and Exterior Design',
    'Interior Remodeling',
    'Flooring Installation',
    'Ceiling Installation',
    'Drywall and Plastering',
    'Painting and Finishing',
    'Windows and Doors Installation',
    'Carpentry and Woodworking',
    'Concrete and Masonry',
    'Structural Engineering',
    'Environmental Remediation',
    'Demolition Services',
    'Security Systems Installation',
    'Fire Protection Systems',
    'Asphalt Paving',
    'Site Preparation and Excavation',
    'Solar Panel Installation',
    'Smart Home Integration',
    'Building Maintenance Services',
    'Insulation Installation',
    'Custom Cabinetry and Woodwork',
    'Waterproofing and Foundation Repair',
    'Elevator and Lift Installation',
    'Fencing and Gate Installation',
    'Swimming Pool Construction',
    'Sustainable Construction Practices',
    'Emergency Response and Restoration',
    'ADA Compliance Upgrades',
    'Pest Control Services',
    'Data and Telecommunications Cabling',
    'Audio-Visual Systems Installation',
    'Waste Management Services',
    'Window Treatments and Blinds Installation',
    'Epoxy Flooring Installation',
    'Commercial Kitchen Installation',
    'Medical Facility Construction',
    'Laboratory Construction',
    'Sports Facility Construction',
    'Retail Store Build-Out',
    'Warehouse Construction',
    'Hospitality Construction',
    'Educational Facility Construction',
    'Library Construction',
    'Theater and Auditorium Construction',
    'Green Building Certification',
    'LEED Compliance Services',
    'Historic Preservation',
    'Artificial Turf Installation',
    'Erosion Control Services',
    'ADA Compliant Ramp Installation',
    'Exterior Lighting Installation',
    'Parking Lot Construction',
    'Tennis Court Construction',
    'Wetland Restoration',
    'Geotechnical Engineering Services',
    'Surveying and Mapping',
    'Modular Building Installation',
    'Oil and Gas Facility Construction',
    'Agricultural Building Construction',
    'Airport Construction',
    'Bridge Construction',
    'Tunnel Construction',
    'Railway Construction',
    'Road Construction',
    'Water Treatment Plant Construction',
    'Sewer and Wastewater Facility Construction',
    'Power Plant Construction',
    'Telecommunication Tower Construction',
  ];

  getConstructionServices(): string[] {
    return this.constructionServices;
  }
  construction_equipment_rentals = [
    'Excavator Rental',
    'Bulldozer Rental',
    'Backhoe Rental',
    'Trencher Rental',
    'Skid-Steer Loader Rental',
    'Crane Rental',
    'Concrete Mixer Rental',
    'Pavement Breaker Rental',
    'Aerial Lift Rental',
    'Compactor Rental',
    'Telehandler Rental',
    'Forklift Rental',
    'Demolition Equipment Rental',
    'Scaffolding Rental',
    'Power Trowel Rental',
    'Chainsaw Rental',
    'Wood Chipper Rental',
    'Welding Equipment Rental',
    'Compactor and Roller Rental',
    'GPS and Laser Equipment Rental',
    'Generator and Power Distribution Rental',
    'Surveying Equipment Rental',
    'Light Tower Rental',
    'Air Compressor Rental',
    'Load Bank Rental',
    'Pipe and Cable Locator Rental',
    'Drill Press Rental',
    'Concrete Saw Rental',
    'Pressure Washer Rental',
    'Material Lift Rental',
    'Earth Auger Rental',
    'Heating Equipment Rental',
    'Cooling Equipment Rental',
    'Traffic Control Equipment Rental',
    'Temporary Fencing Rental',
    'Vacuum Excavator Rental',
    'Crawler Loader Rental',
    'Scissor Lift Rental',
    'Air Scrubber Rental',
    'Boom Lift Rental',
    'Water Pump Rental',
    'Safety Equipment Rental',
    'Concrete Vibrator Rental',
    'Floor Grinder Rental',
    'Sewer Camera Rental',
    'Magnetic Drill Rental',
    'Air Quality Monitor Rental',
    'Fall Protection Equipment Rental',
    'Light Compaction Equipment Rental',
    'Load Haul Dump (LHD) Loader Rental',
  ];
  getConstructionRentalsTags(): string[] {
    return this.construction_equipment_rentals;
  }
  construction_jobs = [
    'Construction Project Manager',
    'Site Supervisor',
    'Civil Engineer',
    'Architect',
    'Structural Engineer',
    'Electrician',
    'Plumber',
    'Heavy Equipment Operator',
    'Carpenter',
    'Masonry Worker',
    'Painter',
    'HVAC Technician',
    'Welder',
    'Surveyor',
    'Estimator',
    'Safety Officer',
    'Project Scheduler',
    'Construction Laborer',
    'Concrete Finisher',
    'Crane Operator',
    'Landscaping Specialist',
    'Roofing Specialist',
    'Demolition Worker',
    'Traffic Control Technician',
    'CAD Technician',
    'Mechanical Engineer',
    'Building Inspector',
    'Quality Control Inspector',
    'Elevator Installer and Repairer',
    'Fire Sprinkler Installer',
    'Solar Panel Installer',
    'Drywall Installer',
    'Flooring Installer',
    'Tile Setter',
    'Glazier',
    'Scaffold Builder',
    'Asphalt Paving Technician',
    'Waterproofing Technician',
    'Fence Installer',
    'Pile Driver Operator',
    'Building Maintenance Technician',
    'Construction Estimator',
    'Environmental Engineer',
    'Geotechnical Engineer',
    'Solar Energy Technician',
    'Construction Labor Foreman',
    'Heavy Equipment Mechanic',
  ];
  construction_materials_sales = [
    'Lumber and Plywood Sales',
    'Concrete and Cement Sales',
    'Steel and Metal Sales',
    'Brick and Block Sales',
    'Roofing Materials Sales',
    'Insulation Materials Sales',
    'Doors and Windows Sales',
    'Flooring Materials Sales',
    'Paint and Coatings Sales',
    'Electrical Wiring and Components Sales',
    'Plumbing Fixtures Sales',
    'HVAC Systems Sales',
    'Siding and Trim Sales',
    'Fasteners and Adhesives Sales',
    'Lighting Fixtures Sales',
    'Ceiling Materials Sales',
    'Fencing and Gates Sales',
    'Masonry and Tile Sales',
    'Drywall and Accessories Sales',
    'Waterproofing Materials Sales',
    'Tools and Equipment Sales',
    'Concrete Reinforcement Sales',
    'Landscaping Materials Sales',
    'Stairs and Railings Sales',
    'Fireplace and Chimney Sales',
    'Bathroom Fixtures Sales',
    'Kitchen Cabinets and Countertops Sales',
    'Gutters and Downspouts Sales',
    'Solar Panels and Accessories Sales',
    'Building Hardware Sales',
    'Glass and Mirrors Sales',
    'Pipes and Fittings Sales',
    'Outdoor Structures Sales',
    'Safety Equipment Sales',
    'Paving Materials Sales',
    'Decorative Stone and Mulch Sales',
    'Foundation Materials Sales',
    'Admixtures and Sealants Sales',
    'Prefab Structures Sales',
    'Acoustic Materials Sales',
    'Traffic Control Devices Sales',
    'Temporary Fencing Sales',
    'Building Maintenance Products Sales',
    'Security Systems Sales',
    'Erosion Control Products Sales',
    'Water Treatment and Filtration Sales',
    'Site Amenities Sales',
  ];
  getConstructionSales(): string[] {
    return this.construction_materials_sales;
  }

  getConstructionJobs(): string[] {
    return this.construction_jobs;
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
  formatTimeDifference(dateCreated: any): string {
    const currentDate = new Date();
    const timeDifference =
      currentDate.getTime() - new Date(dateCreated)?.getTime();
    const minutes = Math.floor(timeDifference / 60000); // 1 minute = 60000 milliseconds
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const year = Math.floor(days / 365);
    if (minutes < 1) {
      return `Now`;
    } else if (minutes === 30) {
      return `Half an hour`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    } else if (days < 7) {
      return `${days} day${days === 1 ? '' : 's'}`;
    } else if (days === 7) {
      return '1 week';
    } else if (days === 14) {
      return '2 week';
    } else if (days === 21) {
      return '3 week';
    } else if (days === 28) {
      return '4 week';
    } else if (days >= 1 && days != 30 && days != 60 && days != 90) {
      return `${days} day${days === 1 ? '' : 's'}`;
    } else {
      return `${months} month${months === 1 ? '' : 's'}`;
    }
  }
  getDaysRemaining(currentDate: any, expiryDate: any): number {
    if (currentDate && expiryDate) {
      const expiryDateTime = new Date(expiryDate)?.getTime();
      const currentTime = new Date(currentDate)?.getTime();
      const timeDifference = expiryDateTime - currentTime;
      const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
      return daysRemaining;
    } else return null;
  }
  differenceInDays(date1: Date, date2: Date): number {
    if (date1 && date2) {
      const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
      const diffInMilliseconds = Math.abs(date1.getTime() - date2.getTime());
      const diffInDays = Math.floor(diffInMilliseconds / millisecondsPerDay);
      return diffInDays;
    } else return null;
  }
}
