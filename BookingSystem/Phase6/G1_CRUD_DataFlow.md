# 1️⃣ CREATE – RResource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant S as Resource Service
    participant DB as PostgreSQL

    U->>F: Submit form
    F->>F: Client-side validation
    F->>B: POST /api/resources (JSON)

    B->>V: Validate request
    V-->>B: Validation result

    alt Validation fails
        B-->>F: 400 Bad Request + errors[]
        F-->>U: Show validation message
    else Validation OK
        B->>S: create Resource(data)
        S->>DB: INSERT INTO resources
        DB-->>S: Result / Duplicate error

        alt Duplicate
            S-->>B: Duplicate detected
            B-->>F: 409 Conflict
            F-->>U: Show duplicate message
        else Success
            S-->>B: Created resource
            B-->>F: 201 Created
            F-->>U: Show success message
        end
    end
```

# 2️⃣ READ — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant S as Resource Service
    participant DB as PostgreSQL

    U->>F: Page reload requests data
    F->>B: GET /api/resources (JSON)
    B->>DB: Request for data

    alt Get fails
        B-->>F: 500 Internal Server Error + errors[]
        F-->>U: Show error in console if request failed
    else Get OK
        DB->>B: Gives the data (JSON)

        alt Resource not modified (cached)
            B-->>F: 304 Not Modified
            F-->>U: Use cached data; shows the existing resources
        else Resource modified
            B-->>F: 200 OK + data
            F-->>U: Shows the existing resources
        end
    end
```

# 3️⃣ UPDATE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant S as Resource Service
    participant DB as PostgreSQL

    U->>F: Submit form
    F->>B: PUT /api/resources/:id (JSON)

    B->>V: Validate request
    V-->>B: Validation result

    alt Validation fails
        B-->>F: 400 Bad Request + errors[]
        F-->>U: Show validation message
    else Resource not found
        B-->>F: 404 Not Found. Resource not found + error message in console + client
        F-->>U: "The resource no longer exists. Refresh the list and try again"
    else UPDATE OK
        B->>S: update Resource(data)
        S->>DB: UPDATE resources with correct :id
        DB-->>S: Result / Update error

        alt Invalid ID error
            S-->>B: error detected
            B-->>F: 400 Invalid ID
            F-->>U: Show error message in console
        else Duplicate resource name error
            S-->>B: error detected
            B-->>F: 409 Conflict
            F-->>U: Show error message "a resource with the same name already exists." + sad face
        else Success
            S-->>B: Updated resource
            B-->>F: 200 OK
            F-->>U: Show success message (and then page reloads so it does the READ loop again)
        end
    end
```

# 4️⃣ DELETE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant S as Resource Service
    participant DB as PostgreSQL

    U->>F: Submit form
    F->>B: DELETE /api/resources/:id (JSON)

    alt DELETE fails
        B-->>F: 400 Bad Request + errors[] or 500 Internal Server error depending what you broke
        F-->>U: Show error message "Not found (404) The resource no longer exists. Refresh and try again"
    else Resource not found
        B-->>F: 404 Not Found
        F-->>U: Show error message "Not found (404) The resource no longer exists. Refresh and try again"
    else DELETE OK
        B->>S: delete Resource(data)
        S->>DB: DELETE resource with [id]
        DB-->>S: Result
        S-->>B: Removed resource
        B-->>F: 204 No Content
        F-->>U: Show success message (reload page => READ loop runs)
    end
```
