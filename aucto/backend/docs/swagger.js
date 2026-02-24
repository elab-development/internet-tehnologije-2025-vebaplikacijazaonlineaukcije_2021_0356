import swaggerJSDoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 5000;
const COOKIE_NAME = process.env.COOKIE_NAME || 'aucto_token';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aucto API',
      version: '1.0.0',
      description:
        'OpenAPI (Swagger) dokumentacija za Aucto backend (aukcije).',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Local' }],

    tags: [
      { name: 'Health', description: 'Health check endpoint' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'Admin user management endpoints' },
      { name: 'Categories', description: 'Categories endpoints' },
      { name: 'Auctions', description: 'Auctions endpoints' },
      { name: 'Bids', description: 'Bids endpoints' },
      { name: 'CartItems', description: 'Cart items endpoints' },
      { name: 'Orders', description: 'Orders endpoints' },
      { name: 'Admin', description: 'Admin analytics endpoints' },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: COOKIE_NAME,
        },
      },

      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Something went wrong' },
          },
        },

        // ---------- ENUMS ----------
        UserRole: {
          type: 'string',
          enum: ['buyer', 'seller', 'admin'],
          example: 'buyer',
        },
        UserStatus: {
          type: 'string',
          enum: ['active', 'inactive', 'blocked'],
          example: 'active',
        },
        AuctionStatus: {
          type: 'string',
          enum: ['active', 'archived', 'finished'],
          example: 'active',
        },

        // ---------- USER ----------
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            fullName: { type: 'string', example: 'Nikola Raičević' },
            email: {
              type: 'string',
              format: 'email',
              example: 'test@mail.com',
            },
            role: { $ref: '#/components/schemas/UserRole' },
            status: { $ref: '#/components/schemas/UserStatus' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        UsersListResponse: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' },
            },
          },
        },

        UpdateUserStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { $ref: '#/components/schemas/UserStatus' },
          },
        },

        UpdateUserRoleRequest: {
          type: 'object',
          required: ['role'],
          properties: {
            role: { $ref: '#/components/schemas/UserRole' },
          },
        },

        // ---------- AUTH ----------
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', example: 'Nikola Raičević' },
            email: {
              type: 'string',
              format: 'email',
              example: 'test@mail.com',
            },
            password: { type: 'string', example: 'StrongPass123!' },
            role: {
              type: 'string',
              enum: ['buyer', 'seller'],
              example: 'buyer',
              description: 'Admin se ne može dodeliti kroz register.',
            },
          },
        },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'test@mail.com',
            },
            password: { type: 'string', example: 'StrongPass123!' },
          },
        },

        AuthUserResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
          },
        },

        MessageResponse: {
          type: 'object',
          properties: { message: { type: 'string', example: 'OK' } },
        },

        // ---------- CATEGORY ----------
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Electronics' },
            description: {
              type: 'string',
              nullable: true,
              example: 'Phones, laptops...',
            },
          },
        },

        CategoriesListResponse: {
          type: 'object',
          properties: {
            categories: {
              type: 'array',
              items: { $ref: '#/components/schemas/Category' },
            },
          },
        },

        CategoryResponse: {
          type: 'object',
          properties: { category: { $ref: '#/components/schemas/Category' } },
        },

        CreateCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Electronics' },
            description: {
              type: 'string',
              nullable: true,
              example: 'Phones, laptops...',
            },
          },
        },

        UpdateCategoryRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Updated name' },
            description: {
              type: 'string',
              nullable: true,
              example: 'Updated desc',
            },
          },
        },

        // ---------- AUCTION ----------
        AuctionListItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            title: { type: 'string', example: 'iPhone 14 Pro' },
            description: { type: 'string', example: 'Like new...' },
            imageUrl: { type: 'string', example: 'https://...' },
            startingPrice: { type: 'number', example: 100.0 },
            currentPrice: { type: 'number', nullable: true, example: 150.0 },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            status: { $ref: '#/components/schemas/AuctionStatus' },
            createdAt: { type: 'string', format: 'date-time' },
            sellerId: { type: 'integer', example: 2 },
            categoryId: { type: 'integer', example: 3 },
            seller: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                fullName: { type: 'string' },
              },
            },
            category: {
              type: 'object',
              properties: { id: { type: 'integer' }, name: { type: 'string' } },
            },
          },
        },

        AuctionDetails: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            title: { type: 'string', example: 'iPhone 14 Pro' },
            description: { type: 'string', example: 'Like new...' },
            imageUrl: { type: 'string', example: 'https://...' },
            startingPrice: { type: 'number', example: 100.0 },
            currentPrice: { type: 'number', nullable: true, example: 150.0 },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            status: { $ref: '#/components/schemas/AuctionStatus' },
            createdAt: { type: 'string', format: 'date-time' },
            seller: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                fullName: { type: 'string' },
              },
            },
            category: {
              type: 'object',
              properties: { id: { type: 'integer' }, name: { type: 'string' } },
            },
          },
        },

        AuctionsListResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 12 },
            total: { type: 'integer', example: 120 },
            totalPages: { type: 'integer', example: 10 },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/AuctionListItem' },
            },
          },
        },

        AuctionResponse: {
          type: 'object',
          properties: {
            auction: { $ref: '#/components/schemas/AuctionDetails' },
          },
        },

        CreateAuctionRequest: {
          type: 'object',
          required: [
            'title',
            'description',
            'startingPrice',
            'startTime',
            'endTime',
            'categoryId',
          ],
          properties: {
            title: { type: 'string', example: 'iPhone 14 Pro' },
            description: { type: 'string', example: 'Like new...' },
            startingPrice: { type: 'number', example: 100.0 },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            categoryId: { type: 'integer', example: 3 },
            image: { type: 'string', format: 'binary' },
            imageUrl: {
              type: 'string',
              description: 'Alternativa za upload fajla',
            },
          },
        },

        UpdateAuctionRequest: {
          type: 'object',
          properties: {
            description: { type: 'string', example: 'Updated description' },
            status: {
              type: 'string',
              enum: ['archived'],
              example: 'archived',
              description:
                'Seller/Admin mogu samo archived u ovom endpoint-u (po pravilima u controlleru).',
            },
            image: { type: 'string', format: 'binary' },
            imageUrl: { type: 'string' },
          },
        },

        ParticipatingAuctionsResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 12 },
            total: { type: 'integer', example: 5 },
            totalPages: { type: 'integer', example: 1 },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  auction: { $ref: '#/components/schemas/AuctionListItem' },
                  myBid: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'integer', example: 1 },
                      amount: { type: 'number', example: 155.0 },
                      createdAt: { type: 'string', format: 'date-time' },
                    },
                  },
                  isWinning: { type: 'boolean', example: true },
                },
              },
            },
          },
        },

        // ---------- BID ----------
        Bid: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            amount: { type: 'number', example: 155.0 },
            createdAt: { type: 'string', format: 'date-time' },
            userId: { type: 'integer', example: 1 },
            auctionId: { type: 'integer', example: 10 },
          },
        },

        PlaceBidRequest: {
          type: 'object',
          required: ['auctionId', 'amount'],
          properties: {
            auctionId: { type: 'integer', example: 10 },
            amount: { type: 'number', example: 155.0 },
          },
        },

        PlaceBidResponse: {
          type: 'object',
          properties: {
            bid: { $ref: '#/components/schemas/Bid' },
            auction: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 10 },
                currentPrice: { type: 'number', example: 155.0 },
              },
            },
          },
        },

        BidListItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            amount: { type: 'number', example: 155.0 },
            createdAt: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 7 },
                fullName: { type: 'string', example: 'Buyer Name' },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'buyer@mail.com',
                },
              },
            },
          },
        },

        BidsByAuctionResponse: {
          type: 'object',
          properties: {
            auction: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 10 },
                status: { $ref: '#/components/schemas/AuctionStatus' },
              },
            },
            bids: {
              type: 'array',
              items: { $ref: '#/components/schemas/BidListItem' },
            },
          },
        },

        MyBidResponse: {
          type: 'object',
          properties: {
            bid: {
              oneOf: [{ $ref: '#/components/schemas/Bid' }, { type: 'null' }],
            },
          },
        },

        // ---------- CART ITEM ----------
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            finalPrice: { type: 'number', example: 155.0 },
            addedAt: { type: 'string', format: 'date-time' },
            userId: { type: 'integer', example: 1 },
            auctionId: { type: 'integer', example: 10 },
          },
        },

        CartItemsListResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 12 },
            total: { type: 'integer', example: 3 },
            totalPages: { type: 'integer', example: 1 },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  finalPrice: { type: 'number' },
                  addedAt: { type: 'string', format: 'date-time' },
                  userId: { type: 'integer' },
                  auctionId: { type: 'integer' },
                  user: { $ref: '#/components/schemas/User' },
                  auction: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      title: { type: 'string' },
                      status: { $ref: '#/components/schemas/AuctionStatus' },
                      endTime: { type: 'string', format: 'date-time' },
                      sellerId: { type: 'integer' },
                      categoryId: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },

        CartItemResponse: {
          type: 'object',
          properties: {
            cartItem: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                finalPrice: { type: 'number' },
                addedAt: { type: 'string', format: 'date-time' },
                user: { $ref: '#/components/schemas/User' },
                auction: { $ref: '#/components/schemas/AuctionDetails' },
              },
            },
          },
        },

        // ---------- ORDER ----------
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 100 },
            totalPrice: { type: 'number', example: 155.0 },
            orderDate: { type: 'string', format: 'date-time' },
            userId: { type: 'integer', example: 1 },
            auctionId: { type: 'integer', example: 10 },
          },
        },

        OrdersListResponse: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 12 },
            total: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 2 },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  totalPrice: { type: 'number' },
                  orderDate: { type: 'string', format: 'date-time' },
                  userId: { type: 'integer' },
                  auctionId: { type: 'integer' },
                  user: { $ref: '#/components/schemas/User' },
                  auction: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      title: { type: 'string' },
                      status: { $ref: '#/components/schemas/AuctionStatus' },
                      sellerId: { type: 'integer' },
                      categoryId: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },

        OrderResponse: {
          type: 'object',
          properties: {
            order: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                totalPrice: { type: 'number' },
                orderDate: { type: 'string', format: 'date-time' },
                user: { $ref: '#/components/schemas/User' },
                auction: { $ref: '#/components/schemas/AuctionDetails' },
              },
            },
          },
        },

        CreateOrderFromCartRequest: {
          type: 'object',
          required: ['cartId'],
          properties: {
            cartId: { type: 'integer', example: 1 },
          },
        },

        CreateOrderResponse: {
          type: 'object',
          properties: { order: { $ref: '#/components/schemas/Order' } },
        },

        // ---------- ADMIN STATS ----------
        AdminStatsResponse: {
          type: 'object',
          properties: {
            range: {
              type: 'object',
              properties: {
                days: { type: 'integer', example: 30 },
                from: { type: 'string', format: 'date-time' },
                to: { type: 'string', format: 'date-time' },
              },
            },
            kpis: {
              type: 'object',
              properties: {
                usersTotal: { type: 'integer', example: 100 },
                auctionsTotal: { type: 'integer', example: 120 },
                bidsTotal: { type: 'integer', example: 500 },
                ordersTotal: { type: 'integer', example: 40 },
                activeAuctions: { type: 'integer', example: 10 },
                bidsInRange: { type: 'integer', example: 50 },
                ordersInRange: { type: 'integer', example: 5 },
                revenueTotal: { type: 'string', example: '12500.50' },
                revenueInRange: { type: 'string', example: '980.25' },
              },
            },
            charts: {
              type: 'object',
              properties: {
                bidsPerDay: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'integer' },
                    },
                  },
                },
                ordersPerDay: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'integer' },
                    },
                  },
                },
                usersPerDay: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'integer' },
                    },
                  },
                },
                usersByRole: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'integer' },
                    },
                  },
                },
                usersByStatus: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'integer' },
                    },
                  },
                },
                auctionsByStatus: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'integer' },
                    },
                  },
                },
                topCategories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'integer' },
                    },
                  },
                },
              },
            },
            top: {
              type: 'object',
              properties: {
                topCategories: { type: 'array', items: { type: 'object' } },
                topSellers: { type: 'array', items: { type: 'object' } },
                endingSoon: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
      },
    },
  },

  apis: ['./routes/*.js', './server.js'],
};

export const swaggerSpec = swaggerJSDoc(options);