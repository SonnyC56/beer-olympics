import React, { useState } from 'react';
import { 
  Button,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  TextField, 
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Select,
  Switch,
  Tabs, TabsList, TabsTrigger, TabsContent,
  FAB,
  Chip, ChipSet,
  NavigationDrawer, NavigationDrawerHeader, NavigationDrawerContent, NavigationItem, NavigationSection
} from '@/components/ui/material';

export const Material3Demo = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [selectedValue, setSelectedValue] = useState('option1');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tab1');
  const [textValue, setTextValue] = useState('');

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] to-[#1A1F3A] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-12 text-center">Material 3 Components</h1>

        {/* Buttons Section */}
        <Card className="mb-8" variant="elevated" elevation={2}>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Material 3 button variants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="filled">Filled Button</Button>
              <Button variant="outlined">Outlined Button</Button>
              <Button variant="text">Text Button</Button>
              <Button variant="elevated">Elevated Button</Button>
              <Button variant="tonal">Tonal Button</Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button variant="filled" leadingIcon="add">With Icon</Button>
              <Button variant="filled" size="small">Small</Button>
              <Button variant="filled" size="large">Large</Button>
              <Button variant="filled" disabled>Disabled</Button>
            </div>
          </CardContent>
        </Card>

        {/* Text Fields Section */}
        <Card className="mb-8" variant="elevated" elevation={2}>
          <CardHeader>
            <CardTitle>Text Fields</CardTitle>
            <CardDescription>Material 3 input fields</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Outlined Text Field"
                placeholder="Enter text..."
                variant="outlined"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
              <TextField
                label="Filled Text Field"
                placeholder="Enter text..."
                variant="filled"
                supportingText="Helper text"
              />
              <TextField
                label="With Leading Icon"
                leadingIcon="search"
                variant="outlined"
              />
              <TextField
                label="With Error"
                error
                errorText="This field has an error"
                variant="outlined"
              />
              <TextField
                label="Multiline Text"
                multiline
                rows={3}
                variant="outlined"
              />
              <TextField
                label="Disabled"
                disabled
                variant="outlined"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="elevated" elevation={1}>
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Level 1 elevation</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is an elevated card with subtle shadow.</p>
            </CardContent>
            <CardFooter>
              <Button variant="text">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="filled">
            <CardHeader>
              <CardTitle>Filled Card</CardTitle>
              <CardDescription>Surface variant background</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is a filled card with different background.</p>
            </CardContent>
            <CardFooter>
              <Button variant="text">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Outlined Card</CardTitle>
              <CardDescription>With border</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is an outlined card with a border.</p>
            </CardContent>
            <CardFooter>
              <Button variant="text">Action</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Dialog Section */}
        <Card className="mb-8" variant="elevated" elevation={2}>
          <CardHeader>
            <CardTitle>Dialog</CardTitle>
            <CardDescription>Material 3 dialog component</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="filled">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Material 3 Dialog</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  This is a Material 3 dialog with proper styling and animations.
                </DialogDescription>
                <DialogFooter>
                  <Button variant="text" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button variant="filled" onClick={() => setDialogOpen(false)}>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Select & Switch Section */}
        <Card className="mb-8" variant="elevated" elevation={2}>
          <CardHeader>
            <CardTitle>Select & Switch</CardTitle>
            <CardDescription>Form controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Select Option"
                options={selectOptions}
                value={selectedValue}
                onValueChange={setSelectedValue}
                variant="outlined"
              />
              <Select
                label="Filled Select"
                options={selectOptions}
                variant="filled"
              />
              <div className="flex items-center gap-4">
                <Switch
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                  label="Toggle switch"
                />
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  checked={true}
                  disabled
                  label="Disabled switch"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Card className="mb-8" variant="elevated" elevation={2}>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>Material 3 tab navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="tab1" icon="home">Home</TabsTrigger>
                <TabsTrigger value="tab2" icon="person">Profile</TabsTrigger>
                <TabsTrigger value="tab3" icon="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="mt-4">
                <p>Home tab content with Material 3 styling.</p>
              </TabsContent>
              <TabsContent value="tab2" className="mt-4">
                <p>Profile tab content goes here.</p>
              </TabsContent>
              <TabsContent value="tab3" className="mt-4">
                <p>Settings tab content for configuration.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Chips Section */}
        <Card className="mb-8" variant="elevated" elevation={2}>
          <CardHeader>
            <CardTitle>Chips</CardTitle>
            <CardDescription>Material 3 chip components</CardDescription>
          </CardHeader>
          <CardContent>
            <ChipSet>
              <Chip label="Assist Chip" icon="help" variant="assist" />
              <Chip label="Filter Chip" variant="filter" selected />
              <Chip label="Input Chip" variant="input" avatar="https://via.placeholder.com/24" />
              <Chip label="Suggestion" variant="suggestion" />
            </ChipSet>
          </CardContent>
        </Card>

        {/* Navigation Drawer */}
        <Card className="mb-8" variant="elevated" elevation={2}>
          <CardHeader>
            <CardTitle>Navigation Drawer</CardTitle>
            <CardDescription>Material 3 navigation component</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="filled" onClick={() => setDrawerOpen(!drawerOpen)}>
              Toggle Navigation Drawer
            </Button>
          </CardContent>
        </Card>

        {/* FAB */}
        <FAB icon="add" position="bottom-right" />

        {/* Navigation Drawer Component */}
        <NavigationDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          variant="modal"
        >
          <NavigationDrawerHeader>
            <h2 className="text-2xl font-bold">Beer Olympics</h2>
          </NavigationDrawerHeader>
          <NavigationDrawerContent>
            <NavigationSection>
              <NavigationItem icon="home" label="Home" selected />
              <NavigationItem icon="dashboard" label="Dashboard" />
              <NavigationItem icon="leaderboard" label="Leaderboard" />
            </NavigationSection>
            <NavigationSection title="Games">
              <NavigationItem icon="sports_esports" label="Beer Pong" />
              <NavigationItem icon="casino" label="Flip Cup" />
              <NavigationItem icon="emoji_events" label="Tournaments" badge={3} />
            </NavigationSection>
          </NavigationDrawerContent>
        </NavigationDrawer>
      </div>
    </div>
  );
};