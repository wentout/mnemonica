module.exports = {
	'parsedUser': {
		'name': 'UserType',
		'props': {
			'email': 'went.out@gmail.com',
			'password': 321
		},
		'joint': {
			'email': '',
			'password': '',
			'description': 'UserType'
		},
		'self': {
			'email': 'went.out@gmail.com',
			'password': 321
		},
		'proto': {
			'email': '',
			'password': '',
			'description': 'UserType'
		},
		'parent': {}
	},
	'parsedUserPL1': {
		'name': 'UserTypePL1',
		'props': {
			'user_pl_1_sign': 'pl_1'
		},
		'joint': {
			'UserTypePL1': 'UserTypePL_1',
			'UserTypePL1Extra': 'UserTypePL_1_Extra'
		},
		'self': {
			'user_pl_1_sign': 'pl_1'
		},
		'proto': {
			'UserTypePL1': 'UserTypePL_1',
			'UserTypePL1Extra': 'UserTypePL_1_Extra'
		},
		'parent': {
			'name': 'UserType',
			'props': {
				'email': 'went.out@gmail.com',
				'password': 321
			},
			'joint': {
				'email': '',
				'password': '',
				'description': 'UserType'
			},
			'self': {
				'email': 'went.out@gmail.com',
				'password': 321
			},
			'proto': {
				'email': '',
				'password': '',
				'description': 'UserType'
			},
			'parent': {}
		}
	},
	'parsedUserPL2': {
		'name': 'UserTypePL2',
		'props': {
			'user_pl_2_sign': 'pl_2',
			'shape': 123
		},
		'joint': {},
		'self': {
			'user_pl_2_sign': 'pl_2',
			'shape': 123
		},
		'proto': {},
		'parent': {
			'name': 'UserType',
			'props': {
				'email': 'went.out@gmail.com',
				'password': 321
			},
			'joint': {
				'email': '',
				'password': '',
				'description': 'UserType'
			},
			'self': {
				'email': 'went.out@gmail.com',
				'password': 321
			},
			'proto': {
				'email': '',
				'password': '',
				'description': 'UserType'
			},
			'parent': {}
		}
	},
	'parsedUserTC': {
		'name': 'UserTypeConstructor',
		'props': {
			'email': 'went.out@gmail.com',
			'password': 321
		},
		'joint': {
			'email': '',
			'password': '',
			'description': 'UserTypeConstructor'
		},
		'self': {
			'email': 'went.out@gmail.com',
			'password': 321
		},
		'proto': {
			'email': '',
			'password': '',
			'description': 'UserTypeConstructor'
		},
		'parent': {}
	},
	'parsedEvenMore': {
		'name': 'EvenMore',
		'props': {
			'str': 're-defined EvenMore str'
		},
		'joint': {
			'EvenMoreSign': 'EvenMoreSign'
		},
		'self': {
			'str': 're-defined EvenMore str'
		},
		'proto': {
			'EvenMoreSign': 'EvenMoreSign'
		},
		'parent': {
			'name': 'OverMore',
			'props': {
				'str': 're-defined OverMore str'
			},
			'joint': {
				'OverMoreSign': 'OverMoreSign'
			},
			'self': {
				'str': 're-defined OverMore str'
			},
			'proto': {
				'OverMoreSign': 'OverMoreSign'
			},
			'parent': {
				'name': 'MoreOver',
				'props': {
					'str': 'moreOver str from test scope'
				},
				'joint': {},
				'self': {
					'str': 'moreOver str from test scope'
				},
				'proto': {},
				'parent': {
					'name': 'WithAdditionalSign',
					'props': {
						'sign': 'userWithoutPassword_2.WithAdditionalSign'
					},
					'joint': {
						'WithAdditionalSignSign': 'WithAdditionalSignSign'
					},
					'self': {
						'sign': 'userWithoutPassword_2.WithAdditionalSign'
					},
					'proto': {
						'WithAdditionalSignSign': 'WithAdditionalSignSign'
					},
					'parent': {
						'name': 'WithoutPassword',
						'props': {
							'password': undefined
						},
						'joint': {
							'WithoutPasswordSign': 'WithoutPasswordSign'
						},
						'self': {
							'password': undefined
						},
						'proto': {
							'WithoutPasswordSign': 'WithoutPasswordSign'
						},
						'parent': {
							'name': 'UserTypeConstructor',
							'props': {
								'email': 'went.out@gmail.com',
								'password': 321
							},
							'joint': {
								'email': '',
								'password': '',
								'description': 'UserTypeConstructor'
							},
							'self': {
								'email': 'went.out@gmail.com',
								'password': 321
							},
							'proto': {
								'email': '',
								'password': '',
								'description': 'UserTypeConstructor'
							},
							'parent': {}
						}
					}
				}
			}
		}
	}
};
