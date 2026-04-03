import React, { useState, useRef, useEffect } from 'react'

// Comprehensive country codes with flags
export const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', iso: 'IN' },
  { code: '+93', country: 'Afghanistan', flag: '🇦🇫', iso: 'AF' },
  { code: '+355', country: 'Albania', flag: '🇦🇱', iso: 'AL' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿', iso: 'DZ' },
  { code: '+1-684', country: 'American Samoa', flag: '🇦🇸', iso: 'AS' },
  { code: '+376', country: 'Andorra', flag: '🇦🇩', iso: 'AD' },
  { code: '+244', country: 'Angola', flag: '🇦🇴', iso: 'AO' },
  { code: '+1-264', country: 'Anguilla', flag: '🇦🇮', iso: 'AI' },
  { code: '+672', country: 'Antarctica', flag: '🇦🇶', iso: 'AQ' },
  { code: '+1-268', country: 'Antigua and Barbuda', flag: '🇦🇬', iso: 'AG' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', iso: 'AR' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲', iso: 'AM' },
  { code: '+297', country: 'Aruba', flag: '🇦🇼', iso: 'AW' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', iso: 'AU' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', iso: 'AT' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿', iso: 'AZ' },
  { code: '+1-242', country: 'Bahamas', flag: '🇧🇸', iso: 'BS' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', iso: 'BH' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', iso: 'BD' },
  { code: '+1-246', country: 'Barbados', flag: '🇧🇧', iso: 'BB' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾', iso: 'BY' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', iso: 'BE' },
  { code: '+501', country: 'Belize', flag: '🇧🇿', iso: 'BZ' },
  { code: '+229', country: 'Benin', flag: '🇧🇯', iso: 'BJ' },
  { code: '+1-441', country: 'Bermuda', flag: '🇧🇲', iso: 'BM' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹', iso: 'BT' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴', iso: 'BO' },
  { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦', iso: 'BA' },
  { code: '+267', country: 'Botswana', flag: '🇧🇼', iso: 'BW' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', iso: 'BR' },
  { code: '+246', country: 'British Indian Ocean Territory', flag: '🇮🇴', iso: 'IO' },
  { code: '+1-284', country: 'British Virgin Islands', flag: '🇻🇬', iso: 'VG' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳', iso: 'BN' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬', iso: 'BG' },
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫', iso: 'BF' },
  { code: '+257', country: 'Burundi', flag: '🇧🇮', iso: 'BI' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭', iso: 'KH' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲', iso: 'CM' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', iso: 'CA' },
  { code: '+238', country: 'Cape Verde', flag: '🇨🇻', iso: 'CV' },
  { code: '+1-345', country: 'Cayman Islands', flag: '🇰🇾', iso: 'KY' },
  { code: '+236', country: 'Central African Republic', flag: '🇨🇫', iso: 'CF' },
  { code: '+235', country: 'Chad', flag: '🇹🇩', iso: 'TD' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', iso: 'CL' },
  { code: '+86', country: 'China', flag: '🇨🇳', iso: 'CN' },
  { code: '+61', country: 'Christmas Island', flag: '🇨🇽', iso: 'CX' },
  { code: '+61', country: 'Cocos Islands', flag: '🇨🇨', iso: 'CC' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', iso: 'CO' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲', iso: 'KM' },
  { code: '+682', country: 'Cook Islands', flag: '🇨🇰', iso: 'CK' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷', iso: 'CR' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷', iso: 'HR' },
  { code: '+53', country: 'Cuba', flag: '🇨🇺', iso: 'CU' },
  { code: '+599', country: 'Curacao', flag: '🇨🇼', iso: 'CW' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾', iso: 'CY' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿', iso: 'CZ' },
  { code: '+243', country: 'Democratic Republic of the Congo', flag: '🇨🇩', iso: 'CD' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', iso: 'DK' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯', iso: 'DJ' },
  { code: '+1-767', country: 'Dominica', flag: '🇩🇲', iso: 'DM' },
  { code: '+1-809', country: 'Dominican Republic', flag: '🇩🇴', iso: 'DO' },
  { code: '+670', country: 'East Timor', flag: '🇹🇱', iso: 'TL' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨', iso: 'EC' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', iso: 'EG' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻', iso: 'SV' },
  { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶', iso: 'GQ' },
  { code: '+291', country: 'Eritrea', flag: '🇪🇷', iso: 'ER' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪', iso: 'EE' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹', iso: 'ET' },
  { code: '+500', country: 'Falkland Islands', flag: '🇫🇰', iso: 'FK' },
  { code: '+298', country: 'Faroe Islands', flag: '🇫🇴', iso: 'FO' },
  { code: '+679', country: 'Fiji', flag: '🇫🇯', iso: 'FJ' },
  { code: '+358', country: 'Finland', flag: '🇫🇮', iso: 'FI' },
  { code: '+33', country: 'France', flag: '🇫🇷', iso: 'FR' },
  { code: '+594', country: 'French Guiana', flag: '🇬🇫', iso: 'GF' },
  { code: '+689', country: 'French Polynesia', flag: '🇵🇫', iso: 'PF' },
  { code: '+241', country: 'Gabon', flag: '🇬🇦', iso: 'GA' },
  { code: '+220', country: 'Gambia', flag: '🇬🇲', iso: 'GM' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪', iso: 'GE' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', iso: 'DE' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', iso: 'GH' },
  { code: '+350', country: 'Gibraltar', flag: '🇬🇮', iso: 'GI' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', iso: 'GR' },
  { code: '+299', country: 'Greenland', flag: '🇬🇱', iso: 'GL' },
  { code: '+1-473', country: 'Grenada', flag: '🇬🇩', iso: 'GD' },
  { code: '+590', country: 'Guadeloupe', flag: '🇬🇵', iso: 'GP' },
  { code: '+1-671', country: 'Guam', flag: '🇬🇺', iso: 'GU' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹', iso: 'GT' },
  { code: '+44', country: 'Guernsey', flag: '🇬🇬', iso: 'GG' },
  { code: '+224', country: 'Guinea', flag: '🇬🇳', iso: 'GN' },
  { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼', iso: 'GW' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾', iso: 'GY' },
  { code: '+509', country: 'Haiti', flag: '🇭🇹', iso: 'HT' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳', iso: 'HN' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', iso: 'HK' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺', iso: 'HU' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸', iso: 'IS' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
  { code: '+98', country: 'Iran', flag: '🇮🇷', iso: 'IR' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶', iso: 'IQ' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', iso: 'IE' },
  { code: '+44', country: 'Isle of Man', flag: '🇮🇲', iso: 'IM' },
  { code: '+972', country: 'Israel', flag: '🇮🇱', iso: 'IL' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', iso: 'IT' },
  { code: '+225', country: 'Ivory Coast', flag: '🇨🇮', iso: 'CI' },
  { code: '+1-876', country: 'Jamaica', flag: '🇯🇲', iso: 'JM' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', iso: 'JP' },
  { code: '+44', country: 'Jersey', flag: '🇯🇪', iso: 'JE' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴', iso: 'JO' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿', iso: 'KZ' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', iso: 'KE' },
  { code: '+686', country: 'Kiribati', flag: '🇰🇮', iso: 'KI' },
  { code: '+383', country: 'Kosovo', flag: '🇽🇰', iso: 'XK' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', iso: 'KW' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬', iso: 'KG' },
  { code: '+856', country: 'Laos', flag: '🇱🇦', iso: 'LA' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻', iso: 'LV' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧', iso: 'LB' },
  { code: '+266', country: 'Lesotho', flag: '🇱🇸', iso: 'LS' },
  { code: '+231', country: 'Liberia', flag: '🇱🇷', iso: 'LR' },
  { code: '+218', country: 'Libya', flag: '🇱🇾', iso: 'LY' },
  { code: '+423', country: 'Liechtenstein', flag: '🇱🇮', iso: 'LI' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹', iso: 'LT' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺', iso: 'LU' },
  { code: '+853', country: 'Macau', flag: '🇲🇴', iso: 'MO' },
  { code: '+389', country: 'Macedonia', flag: '🇲🇰', iso: 'MK' },
  { code: '+261', country: 'Madagascar', flag: '🇲🇬', iso: 'MG' },
  { code: '+265', country: 'Malawi', flag: '🇲🇼', iso: 'MW' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', iso: 'MY' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻', iso: 'MV' },
  { code: '+223', country: 'Mali', flag: '🇲🇱', iso: 'ML' },
  { code: '+356', country: 'Malta', flag: '🇲🇹', iso: 'MT' },
  { code: '+692', country: 'Marshall Islands', flag: '🇲🇭', iso: 'MH' },
  { code: '+596', country: 'Martinique', flag: '🇲🇶', iso: 'MQ' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷', iso: 'MR' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺', iso: 'MU' },
  { code: '+262', country: 'Mayotte', flag: '🇾🇹', iso: 'YT' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', iso: 'MX' },
  { code: '+691', country: 'Micronesia', flag: '🇫🇲', iso: 'FM' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩', iso: 'MD' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨', iso: 'MC' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳', iso: 'MN' },
  { code: '+382', country: 'Montenegro', flag: '🇲🇪', iso: 'ME' },
  { code: '+1-664', country: 'Montserrat', flag: '🇲🇸', iso: 'MS' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦', iso: 'MA' },
  { code: '+258', country: 'Mozambique', flag: '🇲🇿', iso: 'MZ' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲', iso: 'MM' },
  { code: '+264', country: 'Namibia', flag: '🇳🇦', iso: 'NA' },
  { code: '+674', country: 'Nauru', flag: '🇳🇷', iso: 'NR' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', iso: 'NP' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', iso: 'NL' },
  { code: '+687', country: 'New Caledonia', flag: '🇳🇨', iso: 'NC' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', iso: 'NZ' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮', iso: 'NI' },
  { code: '+227', country: 'Niger', flag: '🇳🇪', iso: 'NE' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', iso: 'NG' },
  { code: '+683', country: 'Niue', flag: '🇳🇺', iso: 'NU' },
  { code: '+672', country: 'Norfolk Island', flag: '🇳🇫', iso: 'NF' },
  { code: '+850', country: 'North Korea', flag: '🇰🇵', iso: 'KP' },
  { code: '+1-670', country: 'Northern Mariana Islands', flag: '🇲🇵', iso: 'MP' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', iso: 'NO' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', iso: 'OM' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', iso: 'PK' },
  { code: '+680', country: 'Palau', flag: '🇵🇼', iso: 'PW' },
  { code: '+970', country: 'Palestine', flag: '🇵🇸', iso: 'PS' },
  { code: '+507', country: 'Panama', flag: '🇵🇦', iso: 'PA' },
  { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬', iso: 'PG' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾', iso: 'PY' },
  { code: '+51', country: 'Peru', flag: '🇵🇪', iso: 'PE' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', iso: 'PH' },
  { code: '+64', country: 'Pitcairn', flag: '🇵🇳', iso: 'PN' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', iso: 'PL' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', iso: 'PT' },
  { code: '+1-787', country: 'Puerto Rico', flag: '🇵🇷', iso: 'PR' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA' },
  { code: '+242', country: 'Republic of the Congo', flag: '🇨🇬', iso: 'CG' },
  { code: '+262', country: 'Reunion', flag: '🇷🇪', iso: 'RE' },
  { code: '+40', country: 'Romania', flag: '🇷🇴', iso: 'RO' },
  { code: '+7', country: 'Russia', flag: '🇷🇺', iso: 'RU' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼', iso: 'RW' },
  { code: '+590', country: 'Saint Barthelemy', flag: '🇧🇱', iso: 'BL' },
  { code: '+290', country: 'Saint Helena', flag: '🇸🇭', iso: 'SH' },
  { code: '+1-869', country: 'Saint Kitts and Nevis', flag: '🇰🇳', iso: 'KN' },
  { code: '+1-758', country: 'Saint Lucia', flag: '🇱🇨', iso: 'LC' },
  { code: '+590', country: 'Saint Martin', flag: '🇲🇫', iso: 'MF' },
  { code: '+508', country: 'Saint Pierre and Miquelon', flag: '🇵🇲', iso: 'PM' },
  { code: '+1-784', country: 'Saint Vincent and the Grenadines', flag: '🇻🇨', iso: 'VC' },
  { code: '+685', country: 'Samoa', flag: '🇼🇸', iso: 'WS' },
  { code: '+378', country: 'San Marino', flag: '🇸🇲', iso: 'SM' },
  { code: '+239', country: 'Sao Tome and Principe', flag: '🇸🇹', iso: 'ST' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
  { code: '+221', country: 'Senegal', flag: '🇸🇳', iso: 'SN' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸', iso: 'RS' },
  { code: '+248', country: 'Seychelles', flag: '🇸🇨', iso: 'SC' },
  { code: '+232', country: 'Sierra Leone', flag: '🇸🇱', iso: 'SL' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', iso: 'SG' },
  { code: '+1-721', country: 'Sint Maarten', flag: '🇸🇽', iso: 'SX' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰', iso: 'SK' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮', iso: 'SI' },
  { code: '+677', country: 'Solomon Islands', flag: '🇸🇧', iso: 'SB' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴', iso: 'SO' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', iso: 'ZA' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', iso: 'KR' },
  { code: '+211', country: 'South Sudan', flag: '🇸🇸', iso: 'SS' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', iso: 'ES' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', iso: 'LK' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩', iso: 'SD' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷', iso: 'SR' },
  { code: '+268', country: 'Swaziland', flag: '🇸🇿', iso: 'SZ' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', iso: 'SE' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', iso: 'CH' },
  { code: '+963', country: 'Syria', flag: '🇸🇾', iso: 'SY' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼', iso: 'TW' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯', iso: 'TJ' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿', iso: 'TZ' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', iso: 'TH' },
  { code: '+228', country: 'Togo', flag: '🇹🇬', iso: 'TG' },
  { code: '+690', country: 'Tokelau', flag: '🇹🇰', iso: 'TK' },
  { code: '+676', country: 'Tonga', flag: '🇹🇴', iso: 'TO' },
  { code: '+1-868', country: 'Trinidad and Tobago', flag: '🇹🇹', iso: 'TT' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳', iso: 'TN' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', iso: 'TR' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲', iso: 'TM' },
  { code: '+1-649', country: 'Turks and Caicos Islands', flag: '🇹🇨', iso: 'TC' },
  { code: '+688', country: 'Tuvalu', flag: '🇹🇻', iso: 'TV' },
  { code: '+1-340', country: 'U.S. Virgin Islands', flag: '🇻🇮', iso: 'VI' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬', iso: 'UG' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦', iso: 'UA' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', iso: 'GB' },
  { code: '+1', country: 'United States', flag: '🇺🇸', iso: 'US' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾', iso: 'UY' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿', iso: 'UZ' },
  { code: '+678', country: 'Vanuatu', flag: '🇻🇺', iso: 'VU' },
  { code: '+379', country: 'Vatican', flag: '🇻🇦', iso: 'VA' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪', iso: 'VE' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', iso: 'VN' },
  { code: '+681', country: 'Wallis and Futuna', flag: '🇼🇫', iso: 'WF' },
  { code: '+212', country: 'Western Sahara', flag: '🇪🇭', iso: 'EH' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪', iso: 'YE' },
  { code: '+260', country: 'Zambia', flag: '🇿🇲', iso: 'ZM' },
  { code: '+263', country: 'Zimbabwe', flag: '🇿🇼', iso: 'ZW' },
]


/**
 * PhoneInputWithDialCode — searchable country code picker + phone input
 */
export function PhoneInputWithDialCode({ value = '', onChange }) {
  // Extract dial code and number from stored value
  const parseValue = (v) => {
    const match = COUNTRY_CODES.find(c => v.startsWith(c.code + ' '))
    if (match) return { selected: match, number: v.slice(match.code.length + 1) }
    return { selected: COUNTRY_CODES[0], number: v.replace(/^\+\d+ /, '') }
  }

  const parsed = parseValue(value)
  const [selected, setSelected] = useState(parsed.selected)
  const [number, setNumber] = useState(parsed.number)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)

  // Sync up to parent
  useEffect(() => {
    onChange(`${selected.code} ${number}`)
  }, [selected, number])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  const filtered = COUNTRY_CODES.filter(c =>
    c.country.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search) ||
    c.iso.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', gap: 8, position: 'relative' }} ref={dropdownRef}>
      {/* Dial Code Trigger */}
      <button
        type="button"
        id="dial-code-btn"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 12px',
          border: '1.5px solid var(--border-default)',
          borderRadius: 12,
          background: 'var(--bg-surface)',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--ink)',
          whiteSpace: 'nowrap',
          minWidth: 90,
          height: 48,
          transition: 'border-color 0.2s',
        }}
      >
        <span style={{ fontSize: 20 }}>{selected.flag}</span>
        <span>{selected.code}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          width: 280,
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-default)',
          borderRadius: 14,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search country or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                border: '1.5px solid var(--border-default)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                background: 'var(--bg-elevated)',
                color: 'var(--ink)',
                outline: 'none',
              }}
            />
          </div>
          {/* List */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No results
              </div>
            )}
            {filtered.map((c, i) => (
              <div
                key={`${c.iso}-${i}`}
                onClick={() => { setSelected(c); setOpen(false); setSearch('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: selected.iso === c.iso ? 'rgba(108,99,255,0.08)' : 'transparent',
                  transition: 'background 0.15s',
                  fontSize: 13,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = selected.iso === c.iso ? 'rgba(108,99,255,0.08)' : 'transparent'}
              >
                <span style={{ fontSize: 20, minWidth: 24 }}>{c.flag}</span>
                <span style={{ flex: 1, color: 'var(--ink)', fontWeight: 500 }}>{c.country}</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 600 }}>{c.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Number input */}
      <input
        id="phone-number-input"
        type="tel"
        className="input"
        style={{ flex: 1 }}
        placeholder="9999999999"
        value={number}
        onChange={e => setNumber(e.target.value.replace(/\D/g, ''))}
      />
    </div>
  )
}
