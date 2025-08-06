# Vietnamese City Data Organization

This repository contains scripts and data for organizing Vietnamese location data. Through analysis, we've identified two distinct administrative structures in Vietnamese cities that impact how we should organize our data:

## Two-Tier Administrative Structure (City → Wards)
Many Vietnamese cities follow a two-tier administrative structure where wards (phường) and communes (xã) are directly under city government without district-level divisions. These include:

- Vũng Tàu (16 wards, 1 commune)
- Đà Lạt (12 wards, 4 communes)
- Nha Trang (19 wards, 8 communes)
- Quy Nhơn (16 wards, 5 communes)
- Huế (27 wards, 3 communes)
- Thái Bình (9 wards, 7 communes)
- Cà Mau (9 wards, 6 communes)
- Sóc Trăng (10 wards, 2 communes)
- Phan Thiết (18 wards, 4 communes)
- Tuy Hòa (12 wards, 4 communes)
- Mỹ Tho (10 wards, 7 communes)
- Rạch Giá (12 wards, 1 commune)
- Tam Kỳ (9 wards, 4 communes)
- Đồng Hới (10 wards, 6 communes)
- Bắc Giang (9 wards, 7 communes)
- Bắc Ninh (19 wards, no communes)

For these cities, our data is organized by ward/commune rather than district.

## Three-Tier Administrative Structure (City → Districts → Wards)
Vietnam's largest cities maintain a three-tier structure that includes district-level administration:

- Hà Nội (Capital)
- Thành phố Hồ Chí Minh (Ho Chi Minh City)
- Đà Nẵng
- Hải Phòng
- Cần Thơ

For these major cities, we continue organizing data by district.

## Data Processing and Organization

### File Structure
The processed data is organized in the following structure:

```
/data
  |- /cities
     |- hanoi.json               # All Hanoi restaurants with both district and ward info
     |- vung-tau.json           # All Vung Tau restaurants with ward info
     |- ...
  |- /divisions
     |- /hanoi
        |- ba-dinh.json         # Only Ba Dinh district restaurants
        |- hoan-kiem.json       # Only Hoan Kiem district restaurants
        |- divisions.json       # List of all districts in Hanoi
     |- /vung-tau
        |- phuong-01.json       # Only Phuong 01 ward restaurants
        |- phuong-02.json       # Only Phuong 02 ward restaurants
        |- divisions.json       # List of all wards in Vung Tau
     |- ...
  |- /stats                     # Extraction statistics
     |- vung-tau-extraction-stats.json
     |- ...
```

### Ward Extraction Features

The ward extraction processor includes several sophisticated features:

1. Name Normalization:
   - Consistent capitalization (e.g., "Trung Tâm Đô Thị")
   - Leading zeros for ward numbers (e.g., "Phường 01")
   - Vietnamese diacritics handling
   - City/province name removal from ward names

2. Multiple Extraction Methods:
   - Explicit ward identifiers (Phường, P., etc.)
   - Known ward name matching
   - Position-based extraction
   - Numbered ward detection
   - Abbreviated format handling (P.1 → Phường 01)

3. Validation Rules:
   - Ward number range validation (1-30)
   - Invalid word filtering
   - Incomplete identifier rejection
   - City name conflict detection

4. Special Cases:
   - Compound name handling (e.g., "Trung Tâm Đô Thị")
   - Village name support (Thôn)
   - Known ward variations (both Vietnamese and ASCII)

### Extraction Statistics

For ward-based cities, the processor tracks which extraction method was used for each address:

- explicit_identifier: Direct matches of ward prefixes
- p_format: Abbreviated P. format matches
- known_ward: Matches against known ward names
- position_based: Extraction based on address structure
- numbered_ward: Extraction of numbered wards
- unknown: Cases where ward couldn't be determined

These statistics help identify patterns in the data and areas for improvement.

## Implementation Impact
This distinction affects how we process and organize location data:

1. For major cities (three-tier), we maintain district-based organization
2. For other cities (two-tier), we organize directly by ward/commune
3. Our scripts handle both cases appropriately based on the city being processed

This pattern generally follows Vietnam's city classification system, where most provincial capitals and smaller Class 2/3 cities skip the district level, while centrally-controlled cities and major Class 1 cities incorporate district-level administration.

## Frontend Integration

The organized data structure supports efficient frontend integration:

1. City-level access through /cities/*.json files
2. Division-specific data through /divisions/{city}/*.json files
3. Administrative structure information through divisions.json files
4. Extraction quality metrics through /stats/*.json files

This organization allows for flexible data access patterns while maintaining clear separation of concerns.
