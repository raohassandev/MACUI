import { useState } from 'react';

// Import layout components
import { Screen } from '@/components/ui/layout/Screen';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/layout/Card';
import { Row } from '@/components/ui/layout/Row';
import { Column } from '@/components/ui/layout/Column';
import { Grid } from '@/components/ui/layout/Grid';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/layout/Modal';

// Import text components
import { Heading } from '@/components/ui/text/Heading';
import { Text } from '@/components/ui/text/Text';
import { Paragraph } from '@/components/ui/text/Paragraph';

// Import navigation components
import { Button } from '@/components/ui/navigation/Button';
import { Link } from '@/components/ui/navigation/Link';

// Import input components
import { Input } from '@/components/ui/inputs/Input';
import { Checkbox } from '@/components/ui/inputs/Checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/inputs/Select';

// Import data components
import { Table } from '@/components/ui/data/Table';

// Import constants
import { strings } from '@/constants/strings';
import { useTheme } from '@/redux/hooks/useTheme';

// Define table data interface
interface TableRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

// Define table column interface
interface TableColumn {
  id: string;
  header: string;
  accessor: (row: TableRow) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: TableRow, b: TableRow) => number;
}

// Sample data for table
const tableData: TableRow[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert@example.com',
    role: 'User',
    status: 'Inactive',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'Manager',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Michael Wilson',
    email: 'michael@example.com',
    role: 'User',
    status: 'Active',
  },
];

// Column definition for table
const tableColumns: TableColumn[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: (row: TableRow) => <Text>{row.name}</Text>,
    sortable: true,
    sortFn: (a: TableRow, b: TableRow) => a.name.localeCompare(b.name),
  },
  {
    id: 'email',
    header: 'Email',
    accessor: (row: TableRow) => <Text>{row.email}</Text>,
    sortable: true,
    sortFn: (a: TableRow, b: TableRow) => a.email.localeCompare(b.email),
  },
  {
    id: 'role',
    header: 'Role',
    accessor: (row: TableRow) => <Text>{row.role}</Text>,
    sortable: true,
    sortFn: (a: TableRow, b: TableRow) => a.role.localeCompare(b.role),
  },
  {
    id: 'status',
    header: 'Status',
    accessor: (row: TableRow) => (
      <Text color={row.status === 'Active' ? 'primary' : 'muted'}>
        {row.status}
      </Text>
    ),
    sortable: true,
    sortFn: (a: TableRow, b: TableRow) => a.status.localeCompare(b.status),
  },
  {
    id: 'actions',
    header: 'Actions',
    accessor: () => (
      <Row gap='xs'>
        <Button size='sm' variant='outline'>
          Edit
        </Button>
        <Button size='sm' variant='destructive'>
          Delete
        </Button>
      </Row>
    ),
  },
];

export const ComponentDemoPage = () => {
  // State for form and modal
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Use theme
  const { setTheme } = useTheme();

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  return (
    <Screen style={{ width: '100%', backgroundColor: 'pink' }}>
      <Column gap='xl'>
        {/* Header section */}
        <Card>
          <CardHeader>
            <CardTitle>{strings.pages.home.title}</CardTitle>
            <CardDescription>{strings.pages.home.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Row gap='md'>
              <Button variant='default' onClick={() => setTheme('dark')}>
                Dark Mode
              </Button>
              <Button variant='outline' onClick={() => setTheme('light')}>
                Light Mode
              </Button>
              <Button variant='secondary' onClick={() => setTheme('system')}>
                System Theme
              </Button>
            </Row>
          </CardContent>
        </Card>

        {/* Text Components Section */}
        <Card>
          <CardHeader>
            <CardTitle>Text Components</CardTitle>
          </CardHeader>
          <CardContent>
            <Column gap='md'>
              <Heading level={1}>Heading 1</Heading>
              <Heading level={2}>Heading 2</Heading>
              <Heading level={3}>Heading 3</Heading>
              <Heading level={4}>Heading 4</Heading>
              <Heading level={5}>Heading 5</Heading>
              <Heading level={6}>Heading 6</Heading>

              <Divider />

              <Paragraph size='lead'>
                Lead paragraph with important information.
              </Paragraph>
              <Paragraph>Default paragraph with standard text.</Paragraph>
              <Paragraph size='small'>
                Small paragraph for less important content.
              </Paragraph>

              <Divider />

              <Text variant='large' weight='bold' color='primary'>
                Large Bold Primary Text
              </Text>
              <Text variant='body' weight='medium' color='secondary'>
                Body Medium Secondary Text
              </Text>
              <Text variant='small' weight='normal' color='accent'>
                Small Normal Accent Text
              </Text>
            </Column>
          </CardContent>
        </Card>

        {/* Layout Components Section */}
        <Card>
          <CardHeader>
            <CardTitle>Layout Components</CardTitle>
          </CardHeader>
          <CardContent>
            <Column gap='lg'>
              <Heading level={3}>Grid Layout</Heading>
              <Grid cols={3} gap='md'>
                <Card border shadow>
                  <CardContent>
                    <Text>Grid Item 1</Text>
                  </CardContent>
                </Card>
                <Card border shadow>
                  <CardContent>
                    <Text>Grid Item 2</Text>
                  </CardContent>
                </Card>
                <Card border shadow>
                  <CardContent>
                    <Text>Grid Item 3</Text>
                  </CardContent>
                </Card>
                <Card border shadow>
                  <CardContent>
                    <Text>Grid Item 4</Text>
                  </CardContent>
                </Card>
                <Card border shadow>
                  <CardContent>
                    <Text>Grid Item 5</Text>
                  </CardContent>
                </Card>
                <Card border shadow>
                  <CardContent>
                    <Text>Grid Item 6</Text>
                  </CardContent>
                </Card>
              </Grid>

              <Divider />

              <Heading level={3}>Row Layout</Heading>
              <Row gap='md' wrap>
                <Card border shadow padding='sm'>
                  <CardContent>
                    <Text>Row Item 1</Text>
                  </CardContent>
                </Card>
                <Card border shadow padding='sm'>
                  <CardContent>
                    <Text>Row Item 2</Text>
                  </CardContent>
                </Card>
                <Card border shadow padding='sm'>
                  <CardContent>
                    <Text>Row Item 3</Text>
                  </CardContent>
                </Card>
              </Row>

              <Divider />

              <Heading level={3}>Column Layout</Heading>
              <Column gap='sm' className='w-64'>
                <Card border shadow padding='sm'>
                  <CardContent>
                    <Text>Column Item 1</Text>
                  </CardContent>
                </Card>
                <Card border shadow padding='sm'>
                  <CardContent>
                    <Text>Column Item 2</Text>
                  </CardContent>
                </Card>
                <Card border shadow padding='sm'>
                  <CardContent>
                    <Text>Column Item 3</Text>
                  </CardContent>
                </Card>
              </Column>
            </Column>
          </CardContent>
        </Card>

        {/* Form Components Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
          </CardHeader>
          <CardContent>
            <Grid cols={1} mdCols={2} gap='lg'>
              <Column gap='md'>
                <Input
                  label='Name'
                  placeholder='Enter your name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  helperText='Your full name'
                />

                <Input
                  label='Email'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={
                    email && !email.includes('@') ? 'Invalid email format' : ''
                  }
                  startAdornment={<span>@</span>}
                />

                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger label='Role' className='w-full'>
                    <SelectValue placeholder='Select a role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='user'>User</SelectItem>
                    <SelectItem value='admin'>Admin</SelectItem>
                    <SelectItem value='manager'>Manager</SelectItem>
                  </SelectContent>
                </Select>

                <Checkbox
                  id='subscribe'
                  label='Subscribe to newsletter'
                  checked={subscribed}
                  onCheckedChange={(checked) =>
                    setSubscribed(checked as boolean)
                  }
                  helperText="We'll send you updates about our product"
                />
              </Column>

              <Column gap='md'>
                <Heading level={3}>Input Variants</Heading>

                <Input variant='default' placeholder='Default Input' />

                <Input variant='filled' placeholder='Filled Input' />

                <Input variant='outline' placeholder='Outline Input' />

                <Input
                  placeholder='Small Input'
                  className='h-8 px-2 py-1 text-xs'
                />

                <Input
                  placeholder='Large Input'
                  className='h-12 px-4 py-3 text-base'
                />

                <Input
                  state='error'
                  placeholder='Error Input'
                  error='This field has an error'
                />

                <Input
                  state='success'
                  placeholder='Success Input'
                  helperText='This field is valid'
                />
              </Column>
            </Grid>
          </CardContent>
          <CardFooter>
            <Row gap='md' justifyContent='end'>
              <Button variant='outline'>{strings.common.cancel}</Button>
              <Button>{strings.common.submit}</Button>
            </Row>
          </CardFooter>
        </Card>

        {/* Table Component Section */}
        <Card>
          <CardHeader>
            <CardTitle>Table Component</CardTitle>
          </CardHeader>
          <CardContent>
            <Table
              data={tableData}
              columns={tableColumns}
              sortable
              variant='hoverable'
              pagination={{
                pageSize,
                pageIndex,
                totalCount: tableData.length,
                onPageChange: setPageIndex,
                onPageSizeChange: setPageSize,
              }}
              onRowClick={() => console.log('Row clicked')}
            />
          </CardContent>
        </Card>

        {/* Modal Component Section */}
        <Card>
          <CardHeader>
            <CardTitle>Modal Component</CardTitle>
          </CardHeader>
          <CardContent>
            <Row gap='md'>
              <Button onClick={() => setModalOpen(true)}>Open Modal</Button>

              <Modal open={modalOpen} onOpenChange={setModalOpen}>
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Modal Title</ModalTitle>
                    <ModalDescription>
                      This is a description of the modal.
                    </ModalDescription>
                  </ModalHeader>
                  <CardContent>
                    <Column gap='md'>
                      <Paragraph>
                        This is a modal component that can be used to display
                        detailed information or collect input from users.
                      </Paragraph>
                      <Input
                        label='Modal Input'
                        placeholder='Type something here'
                      />
                    </Column>
                  </CardContent>
                  <ModalFooter>
                    <Button
                      variant='outline'
                      onClick={() => setModalOpen(false)}
                    >
                      {strings.common.cancel}
                    </Button>
                    <Button onClick={() => setModalOpen(false)}>
                      {strings.common.save}
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Row>
          </CardContent>
        </Card>

        {/* Button & Link Components Section */}
        <Card>
          <CardHeader>
            <CardTitle>Button & Link Components</CardTitle>
          </CardHeader>
          <CardContent>
            <Column gap='lg'>
              <Heading level={3}>Button Variants</Heading>
              <Row gap='md' wrap>
                <Button variant='default'>Default</Button>
                <Button variant='secondary'>Secondary</Button>
                <Button variant='destructive'>Destructive</Button>
                <Button variant='outline'>Outline</Button>
                <Button variant='ghost'>Ghost</Button>
                <Button variant='link'>Link</Button>
              </Row>

              <Heading level={3}>Button Sizes</Heading>
              <Row gap='md' alignItems='center'>
                <Button size='sm'>Small</Button>
                <Button size='default'>Default</Button>
                <Button size='lg'>Large</Button>
                <Button size='icon'>
                  <span role='img' aria-label='icon'>
                    💡
                  </span>
                </Button>
              </Row>

              <Heading level={3}>Button States</Heading>
              <Row gap='md' wrap>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button
                  startIcon={
                    <span role='img' aria-label='start'>
                      ⭐
                    </span>
                  }
                >
                  With Start Icon
                </Button>
                <Button
                  endIcon={
                    <span role='img' aria-label='end'>
                      ⮕
                    </span>
                  }
                >
                  With End Icon
                </Button>
              </Row>

              <Divider />

              <Heading level={3}>Link Variants</Heading>
              <Row gap='lg' wrap>
                <Link href='#' variant='default'>
                  Default Link
                </Link>
                <Link href='#' variant='underlined'>
                  Underlined Link
                </Link>
                <Link href='#' variant='muted'>
                  Muted Link
                </Link>
                <Link href='#' variant='nav'>
                  Navigation Link
                </Link>
                <Link href='#' variant='button'>
                  Button Link
                </Link>
              </Row>

              <Heading level={3}>Link Features</Heading>
              <Row gap='lg' wrap>
                <Link href='https://example.com' external>
                  External Link
                </Link>
                <Link
                  href='#'
                  startIcon={
                    <span role='img' aria-label='icon'>
                      🔗
                    </span>
                  }
                >
                  Link with Icon
                </Link>
              </Row>
            </Column>
          </CardContent>
        </Card>
      </Column>
    </Screen>
  );
};

// Divider component for demo
const Divider = () => <div className='h-px w-full bg-border my-4' />;
